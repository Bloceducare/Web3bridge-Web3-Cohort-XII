import {ethers} from 'hardhat';
import {expect} from 'chai';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';



describe('Agreement Factory', () => {
    async function deployAgreementFixture() {
        const tokenFactory = await ethers.getContractFactory('Token');
        const token = await tokenFactory.deploy("Leo Token", "LTK");


        const agreementFactory = await ethers.getContractFactory('AgreementFactory');
        const agreement = await agreementFactory.deploy(token.target);


        const [owner, addr1, addr2] = await ethers.getSigners();

        return {  token, agreement, owner, addr1, addr2 };
    }

    describe('Deployment', () => {
        it("Should deploy Token", async () => {
            const {token} = await loadFixture(deployAgreementFixture);
            expect(await token.name()).to.equal("Leo Token");
        });
        it('Should deploy Agreement Factory', async () => {
            const {agreement, token} = await loadFixture(deployAgreementFixture);
            expect(await agreement.tokenAddress()).to.equal(token.target);
        });
    })

    describe('createAgreement', () => {
        it('Should create an agreement', async () => {
            const {agreement, token, owner, addr1, addr2} = await loadFixture(deployAgreementFixture);
            const created = await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));
            expect(created).to.emit(agreement, 'AgreementCreated');
        });
        it("Should deploy NFT contract", async() => {
            const {agreement, owner, } = await loadFixture(deployAgreementFixture);
          
            await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));

            expect(await agreement.nftAddresses(owner.address)).to.not.be.equal(ethers.ZeroAddress);
        })
        it("Should deploy the Agreement Contract", async() => {
            const {agreement, owner, } = await loadFixture(deployAgreementFixture);
          
            await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));

            expect(await agreement.agreementAddresses(owner.address)).to.not.be.equal(ethers.ZeroAddress);
        })
        it("Should revert when amount is less than or equal to zero", async () => {
            const {agreement, owner, } = await loadFixture(deployAgreementFixture);

            await expect(agreement.createAgreement("My rent", ethers.parseUnits("0", 18))).to.be.revertedWithCustomError(agreement, 'InvalidAmount');
        });
    });

    describe("signAgreement", ()=>{
        it("Should sign an agreement", async () => {
            const {agreement, token, owner, addr1} = await loadFixture(deployAgreementFixture);
            await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));
            await token.mint(addr1.address, ethers.parseUnits("1000", 18));
            await token.connect(addr1).approve(agreement.target, ethers.parseUnits("1000", 18));
            await agreement.connect(addr1).signAgreement(owner.address);

            expect(await token.connect(addr1).balanceOf(addr1.address)).to.be.equal(ethers.parseUnits("900", 18));
        });

        it("Should revert when agreement does not exist", async () => {
            const {agreement, token, owner, addr1} = await loadFixture(deployAgreementFixture);
            await token.mint(addr1.address, ethers.parseUnits("1000", 18));
            await token.connect(addr1).approve(agreement.target, ethers.parseUnits("100", 18));
            await expect(agreement.connect(addr1).signAgreement(owner.address)).to.be.revertedWithCustomError(agreement, 'Unauthorized');
        });

        it("Should revert when balance is less than or equal to zero", async () => {
            const {agreement, token, owner, addr1} = await loadFixture(deployAgreementFixture);
            await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));
            await token.connect(addr1).approve(agreement.target, ethers.parseUnits("100", 18));
            await expect(agreement.connect(addr1).signAgreement(owner.address)).to.be.revertedWithCustomError(agreement, 'InvalidAmount');
        });

        it("Should revert when agreement is already signed", async () => {
            const {agreement, token, owner, addr1} = await loadFixture(deployAgreementFixture);
            await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));
            await token.mint(addr1.address, ethers.parseUnits("1000", 18));
            await token.connect(addr1).approve(agreement.target, ethers.parseUnits("100", 18));
            await agreement.connect(addr1).signAgreement(owner.address);
            await expect(agreement.connect(addr1).signAgreement(owner.address)).to.be.reverted;
        });
        it('should emit AgreementSigned event', async () => {
            const {agreement, token, owner, addr1} = await loadFixture(deployAgreementFixture);
            await agreement.createAgreement("My rent", ethers.parseUnits("100", 18));
            await token.mint(addr1.address, ethers.parseUnits("1000", 18));
            await token.connect(addr1).approve(agreement.target, ethers.parseUnits("100", 18));
            const signed = await agreement.connect(addr1).signAgreement(owner.address);
            expect(signed).to.emit(agreement, 'AgreementSigned');
        });

    })

})