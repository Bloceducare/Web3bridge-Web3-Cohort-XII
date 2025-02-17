import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, World");

    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello, World");
  });
  it("should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, World");

    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello, World");
  });
  it("should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, World");

    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello, World");
  });
  it("should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, World");

    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello, World");
  });
  it("should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, World");

    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello, World");
  });
  it("should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, World");

    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello, World");
  });

});
