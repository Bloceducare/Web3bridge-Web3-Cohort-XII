
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";



async function main() {

    console.log("-----------------------deploy contract---------------\n\n")


    const tokenName = "CROWDFUNDING TOKEN"
    const tokenSymbol = "CRT"
    const totalSupply = ethers.parseEther("1000000000")
    const TOKENADRR = "0xA598100E46C7bb3cE8A6ED4c20157EC7b117227c";
    const [owner, creator1, creator2, contributor1, contributor2] = await ethers.getSigners();

    const Token = await ethers.deployContract("ERC20Token", [tokenName, tokenSymbol, totalSupply]);
    await Token.waitForDeployment();


    // const Crowdfunding = await ethers.deployContract("Crowdfunding", [Token.target]);

    // await Crowdfunding.waitForDeployment();

    // console.log(
    //     `Crowdfunding contract successfully deployed to: ${Crowdfunding.target}`
    // );

    console.log(
        `Token contract successfully deployed to: ${Token.target}`
    );


    // console.log("-----------------------Create campagn------------------\n\n")

    // const deadline =  await time.latest() + 86400;
    // let tx = await Crowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1",  100000, deadline);

    // console.log(tx)


    // console.log("-----------------------Contribution 1------------------\n\n")

    // await Token.transfer(contributor1.address, 1000);
    // await Token.connect(contributor1).approve(Crowdfunding.target, 1000);

    // tx = await Crowdfunding.connect(contributor1).contribute(1, 1000);

    // const raisedAmount = (await Crowdfunding.campaigns(1)).raisedAmount;

    // console.log(tx)

    // console.log(raisedAmount.toString())


    // console.log("-----------------------revert a Contribution 1------------------\n\n")



    // tx = await Crowdfunding.connect(contributor1).reverseContribution(1, 1000);

    // const raisedAmountAfter = (await Crowdfunding.campaigns(1)).raisedAmount;

    // console.log(tx)

    // console.log(raisedAmountAfter.toString())

    // console.log("-----------------------withdraw funds-----------------\n\n")

    // await Token.transfer(contributor2.address, 99000);
    // await Token.connect(contributor2).approve(Crowdfunding.target, 99000);

    // await time.increase(86500)
    // tx = await Crowdfunding.connect(creator1).withdraw(1);

    console.log(totalSupply)
 
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});