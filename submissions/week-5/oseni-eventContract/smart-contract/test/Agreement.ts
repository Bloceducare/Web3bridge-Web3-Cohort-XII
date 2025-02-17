const { expect } = require("chai");

describe("Agreement", function () {
    let Agreement, agreement, owner, recipient;

    beforeEach(async function () {
        [owner, recipient] = await ethers.getSigners();
        Agreement = await ethers.getContractFactory("AgreementSigningEscrow");
        agreement = await Agreement.deploy();
    });

    it("Should create an agreement", async function () {
        await agreement.createAgreement("Rent Agreement", "House rental agreement", recipient.address, { value: ethers.utils.parseEther("1") });
        const agreementDetails = await agreement.getAgreement(0);
        expect(agreementDetails[0]).to.equal("Rent Agreement");
    });

    it("Should allow both parties to sign", async function () {
        await agreement.createAgreement("Job Contract", "Freelance project agreement", recipient.address, { value: ethers.utils.parseEther("1") });

        await agreement.connect(owner).signAgreement(0);
        await agreement.connect(recipient).signAgreement(0);

        const agreementDetails = await agreement.getAgreement(0);
        expect(agreementDetails[5]).to.equal(true); // signedByInitiator
        expect(agreementDetails[6]).to.equal(true); // signedByRecipient
    });

    it("Should execute agreement and transfer funds", async function () {
        await agreement.createAgreement("Sales Agreement", "Selling a digital asset", recipient.address, { value: ethers.utils.parseEther("1") });

        await agreement.connect(owner).signAgreement(0);
        await agreement.connect(recipient).signAgreement(0);

        await expect(() => agreement.executeAgreement(0))
            .to.changeEtherBalance(recipient, ethers.utils.parseEther("1"));
    });
});
