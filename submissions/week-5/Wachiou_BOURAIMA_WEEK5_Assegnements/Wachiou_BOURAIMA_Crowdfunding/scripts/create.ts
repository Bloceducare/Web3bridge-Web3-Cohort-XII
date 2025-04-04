import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import {ethers} from 'hardhat';



async function main() {
    const TOKENADRR = "0xA598100E46C7bb3cE8A6ED4c20157EC7b117227c";
    const CrowdAdrr = "0xB48286C13E59e53826e1b2D95beA4e4a621a4Ba0";

    const Token = await ethers.getContractAt("ERC20Token", TOKENADRR);
    const Crowdfunding = await ethers.getContractAt("Crowdfunding", CrowdAdrr);
    const creator1 = await ethers.getSigner("0xc0dd2bFDAC5a426294BC88DEAFEB444aD98e7121")
    const contributor1 = await ethers.getSigner("0x6f1E48D6F8a3e7338098Cf35ee684d2c9dD43B06")



    // console.log("-----------------------Create campagn------------------\n\n")

    // const deadline =  await time.latest() + 86400;
    // let tx = await Crowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1",  100000, deadline);

    // console.log(tx)


    // console.log("-----------------------Contribution 1------------------\n\n")

    // const amount = ethers.parseEther("10000");

    // const _amount = ethers.parseEther("20000");

    // console.log("1: ", amount)

    // console.log("2: ", _amount)

    // await Token.transfer("0x6f1E48D6F8a3e7338098Cf35ee684d2c9dD43B06", amount);
    // await Token.transfer("0xc0dd2bFDAC5a426294BC88DEAFEB444aD98e7121", amount);
    // await Token.connect(contributor1).approve(Crowdfunding.target, 1000);

    // tx = await Crowdfunding.connect(contributor1).contribute(1, 1000);

    // const raisedAmount = (await Crowdfunding.campaigns(1)).raisedAmount;

    // console.log(tx)

    // console.log(raisedAmount.toString())


    console.log("-----------------------revert a Contribution 1------------------\n\n")



    // tx = await Crowdfunding.connect(contributor1).reverseContribution(1, 1000);

    // const raisedAmountAfter = (await Crowdfunding.campaigns(1)).raisedAmount;

    // console.log(tx)

    // console.log(raisedAmountAfter.toString())

    // console.log("-----------------------withdraw funds-----------------\n\n")

    // await Token.transfer(contributor2.address, 99000);
    // await Token.connect(contributor2).approve(Crowdfunding.target, 99000);

    // await time.increase(86500)
    // tx = await Crowdfunding.connect(creator1).withdraw(1);

   

}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});