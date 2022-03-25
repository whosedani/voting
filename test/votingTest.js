const chai = require("chai");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { time } = require("@openzeppelin/test-helpers");
chai.use(solidity);


describe("Voting contarct", function () {
    let voting, votingAddress, owner, startTime, endTime;

    beforeEach(async function () {
        voting = await (await ethers.getContractFactory("voting")).deploy();
        await voting.deployed();
        votingAddress = voting.address;
        [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners();
    })

    describe("Deploy", async function () {
        it("Should set the right owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        })
    })

    describe("Create voting", async function () {
        it("Should create voting with owner", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            expect(await voting.votingIsStarted()).to.equal(true);
        })

        it("Shouldn't create voting with other acc", async function () {
            await expect(voting.connect(acc1).createVoting()).to.be.revertedWith("Not an owner");
            expect(await voting.votingIsStarted()).to.equal(false);
        })
    })

    describe("Add candidates", async function () {
        it("Should add two candidates with owner acc", async function () {
            await voting.connect(owner).addCandidate(acc1.address);
            await voting.connect(owner).addCandidate(acc2.address);
            expect(await voting.connect(owner).returnCandidates()).to.deep.equal([acc1.address, acc2.address]);
        })

        it("Shouldn't add candidate with not owner acc", async function () {
            await expect(voting.connect(acc1).addCandidate(acc1.address)).to.be.revertedWith("Not an owner");
        })

        it("Shouldn't add existent candidate", async function () {
            await voting.connect(owner).addCandidate(acc1.address);
            await expect(voting.connect(owner).addCandidate(acc1.address)).to.be.revertedWith("This address already exists");
        })
    })

    describe("Vote", async function () {
        it("Should give two votes for acc1 and gives three votes for acc2", async function () {
            await (await voting.connect(owner).createVoting()).wait();

            await voting.connect(owner).addCandidate(acc1.address);
            await voting.connect(owner).addCandidate(acc2.address);

            const value = { value: ethers.utils.parseEther('0.01') };
            await voting.connect(owner).vote(acc1.address, value);
            await voting.connect(acc1).vote(acc1.address, value);
            await voting.connect(acc2).vote(acc2.address, value)
            await voting.connect(acc3).vote(acc2.address, value);
            await voting.connect(acc4).vote(acc2.address, value);

            expect(await voting.amountOfVotingsForCandidate(acc1.address)).to.be.equal(2);
            expect(await voting.amountOfVotingsForCandidate(acc2.address)).to.be.equal(3);
            expect(await ethers.provider.getBalance(votingAddress)).to.be.equal(ethers.utils.parseEther('0.05'));
        })

        it("Shouldn't give second vote from one acc", async function () {
            await (await voting.connect(owner).createVoting()).wait();

            await voting.connect(owner).addCandidate(acc1.address);

            const value = { value: ethers.utils.parseEther('0.01') };
            await voting.connect(owner).vote(acc1.address, value);
            await expect(voting.connect(owner).vote(acc1.address, value)).to.be.revertedWith("You can vote only once");
        })

        it("Souldn't vote for non-existent candidate", async function () {
            await (await voting.connect(owner).createVoting()).wait();

            await voting.connect(owner).addCandidate(acc1.address);

            const value = { value: ethers.utils.parseEther('0.01') };
            await expect(voting.connect(owner).vote(acc2.address, value)).to.be.revertedWith("There is no candidate with this address");
        })
    })

    describe("End voting", async function () {
        it("Should send 90% of a contract balance to the winner of voting", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            await voting.connect(owner).addCandidate(acc1.address);

            const value = { value: ethers.utils.parseEther('0.01') };
            await voting.connect(owner).vote(acc1.address, value);
            let balanceBefore = ethers.utils.formatEther(await ethers.provider.getBalance(acc1.address));

            await network.provider.send("evm_increaseTime", [260000]);
            await network.provider.send("evm_mine");

            await voting.connect(owner).endVoting();
            let balanceAfter = ethers.utils.formatEther(await ethers.provider.getBalance(acc1.address));
            let balanceChange = balanceAfter - balanceBefore;
            balanceChange = Math.round(balanceChange * 1e4) / 1e4;
            let contractBalance = ethers.utils.formatEther(await ethers.provider.getBalance(votingAddress));
            contractBalance = Math.round(contractBalance * 1e4) / 1e4;
            expect(balanceChange).to.be.equal(0.009);
            expect(contractBalance).to.be.equal(0.001);
        })

        it("Shouldn't end until 3 days have passed after start", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            await expect(voting.connect(owner).endVoting()).to.be.revertedWith("It hasn't been three days yet");
        })

        it("Shouldn't end when voting hasn't started", async function () {
            await expect(voting.connect(owner).endVoting()).to.be.revertedWith("Voting hasn't started yet");
        })
    })

    describe("Withdraw comission", async function () {
        it("Should withdraw commission to owner acc", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            await voting.connect(owner).addCandidate(acc1.address);
            let balanceBefore = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));

            const value = { value: ethers.utils.parseEther('0.01') };
            await voting.connect(acc1).vote(acc1.address, value);

            await network.provider.send("evm_increaseTime", [260000]);
            await network.provider.send("evm_mine");

            await voting.connect(acc1).endVoting();

            await voting.connect(owner).withdrawCommission(owner.address);

            let balanceAfter = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));
            let balanceChange = balanceAfter - balanceBefore;
            balanceChange = Math.round(balanceChange * 1e4) / 1e4;

            let contractBalance = ethers.utils.formatEther(await ethers.provider.getBalance(votingAddress));
            contractBalance = Math.round(contractBalance * 1e4) / 1e4;

            expect(balanceChange).to.be.equal(0.001);
            expect(contractBalance).to.be.equal(0);
        })

        it("Shouldn't withdraw commission from other accs exepts of owner", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            await voting.connect(owner).addCandidate(acc1.address);
            let balanceBefore = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));

            const value = { value: ethers.utils.parseEther('0.01') };
            await voting.connect(acc1).vote(acc1.address, value);

            await network.provider.send("evm_increaseTime", [260000]);
            await network.provider.send("evm_mine");

            await voting.connect(acc1).endVoting();

            await expect(voting.connect(acc1).withdrawCommission(acc1.address)).to.be.revertedWith("Not an owner");
        })

        it("Shouldn't withdraw commission when voting hasn't started", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            await expect(voting.connect(owner).withdrawCommission(owner.address)).to.be.revertedWith("Voting hasn't ended yet");
        })
    })

    describe("Return candidates", async function () {
        it("Should return correct candidates", async function () {
            await voting.connect(owner).addCandidate(acc1.address);
            await voting.connect(owner).addCandidate(acc2.address);
            await voting.connect(owner).addCandidate(acc3.address);

            expect(await voting.returnCandidates()).to.deep.equal([acc1.address, acc2.address, acc3.address]);
        })
    })

    describe("Return voters", async function () {
        it("Should return correct voters", async function () {
            await (await voting.connect(owner).createVoting()).wait();
            await voting.connect(owner).addCandidate(acc1.address);
            const value = { value: ethers.utils.parseEther('0.01') };
            await voting.connect(acc1).vote(acc1.address, value);
            await voting.connect(acc2).vote(acc1.address, value);
            await voting.connect(acc3).vote(acc1.address, value);

            expect(await voting.returnVoters()).to.deep.equal([acc1.address, acc2.address, acc3.address]);
        })
    })
})