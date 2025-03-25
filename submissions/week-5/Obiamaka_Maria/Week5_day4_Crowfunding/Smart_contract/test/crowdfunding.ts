import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

describe('CrowdFunding', function () {
    async function deployCrowdFundingFixture() {
        const [owner, address1, address2, address3] = await hre.ethers.getSigners();

        const ERC20 = await hre.ethers.getContractFactory('OurERC20');
        const erc20Instance = await ERC20.deploy('AMAKA', 'AMAKS');

        const CrowdFunding = await hre.ethers.getContractFactory('CrowdFunding');
        const cfContract = await CrowdFunding.deploy(erc20Instance.target);

        return { cfContract, erc20Instance, owner, address1, address2, address3 };
    }

    it('Should deploy contracts successfully', async function () {
        const { cfContract, erc20Instance } = await loadFixture(deployCrowdFundingFixture);
        expect(cfContract.target).to.not.equal(0);
        expect(erc20Instance.target).to.not.equal(0);
    });

    it('Should allow a user to create a project', async function () {
        const { cfContract, owner } = await loadFixture(deployCrowdFundingFixture);

        const startDate = BigInt(Math.floor(Date.now() / 1000) + 3600); 
        const endDate = startDate +  BigInt(8600); 
        const projectFee = hre.ethers.parseEther('10'); 

        await cfContract.connect(owner).createProject(
            "Project A", 
            "Help the poor", 
            startDate, 
            endDate, 
            projectFee,
            { from: owner.address } 
        );

        // Fetch project at index 0 instead of 1 (assuming zero-based indexing)
        const project = await cfContract.projects(0);
        expect(project.organizer).to.equal(owner.address);
    });

    it('Should prevent creating a project with an invalid date', async function () {
        const { cfContract, owner } = await loadFixture(deployCrowdFundingFixture);

        const startDate = (await time.latest()) - 1000; // Past date
        const endDate = startDate + 10000;
        const projectFee = hre.ethers.parseEther('10');

        await expect(
            cfContract.connect(owner).createProject(
                'Project B', 
                'Invalid project', 
                startDate, 
                endDate, 
                projectFee,
             { from: owner.address } 
          
            )
        ).to.be.revertedWith('PROJECT DATE MUST BE IN FUTURE');
    });

    it('Should allow users to donate to a project', async function () {
        const { cfContract, erc20Instance, owner, address1 } = await loadFixture(deployCrowdFundingFixture);
        
        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const projectFee = hre.ethers.parseEther('10');

        await cfContract.connect(owner).createProject(
            'Project C', 
            'Donation project', 
            startDate, 
            endDate, 
            projectFee, 
            owner.address
        );

        await erc20Instance.mint(address1.address, hre.ethers.parseEther('20'));
        await erc20Instance.connect(address1).approve(cfContract.target, hre.ethers.parseEther('5'));

        await expect(cfContract.connect(address1).donateProject(0, hre.ethers.parseEther('5')))
            .to.emit(cfContract, 'UserDonated');

        const balance = await erc20Instance.balanceOf(address1.address);
        expect(balance).to.equal(hre.ethers.parseEther('15'));
    });

    it('Should allow organizer to withdraw funds if goal is reached', async function () {
        const { cfContract, erc20Instance, owner, address1 } = await loadFixture(deployCrowdFundingFixture);

        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const projectFee = hre.ethers.parseEther('10');

        await cfContract.connect(owner).createProject(
            'Project D', 
            'Successful funding project', 
            startDate, 
            endDate, 
            projectFee, 
            owner.address
        );

        await erc20Instance.mint(address1.address, hre.ethers.parseEther('10'));
        await erc20Instance.connect(address1).approve(cfContract.target, hre.ethers.parseEther('10'));
        await cfContract.connect(address1).donateProject(0, hre.ethers.parseEther('10'));

        await time.increaseTo(endDate + 1);

        await expect(cfContract.connect(owner).withdrawFunds(0))
            .to.emit(cfContract, 'FundsWithdrawn')
            .withArgs(0, owner.address);

        const organizerBalance = await erc20Instance.balanceOf(owner.address);
        expect(organizerBalance).to.equal(hre.ethers.parseEther('10'));
    });

    it('Should allow donors to get refunds if the goal is not reached', async function () {
        const { cfContract, erc20Instance, owner, address1 } = await loadFixture(deployCrowdFundingFixture);

        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const projectFee = hre.ethers.parseEther('10');

        await cfContract.connect(owner).createProject(
            'Project E', 
            'Failed funding project', 
            startDate, 
            endDate, 
            projectFee, 
            owner.address
        );

        await erc20Instance.mint(address1.address, hre.ethers.parseEther('3'));
        await erc20Instance.connect(address1).approve(cfContract.target, hre.ethers.parseEther('3'));
        await cfContract.connect(address1).donateProject(0, hre.ethers.parseEther('3'));

        await time.increaseTo(endDate + 1);

        await expect(cfContract.connect(owner).withdrawFunds(0)).to.be.revertedWith('GOAL NOT REACHED');

        await expect(cfContract.connect(address1).withdrawDonation(0))
            .to.emit(cfContract, 'DonationRefunded')
            .withArgs(0, address1.address, hre.ethers.parseEther('3'));

        const balance = await erc20Instance.balanceOf(address1.address);
        expect(balance).to.equal(hre.ethers.parseEther('3'));
    });
});