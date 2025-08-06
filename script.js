// Election System JavaScript
class ElectionSystem {
    constructor() {
        this.elections = JSON.parse(localStorage.getItem('elections')) || [];
        this.currentElection = null;
        this.votingActive = false;
        this.init();
    }

    init() {
        this.loadElections();
        this.setupEventListeners();
        this.showMainPage();
    }

    setupEventListeners() {
        // Main navigation
        document.getElementById('newElectionBtn').addEventListener('click', () => {
            this.showCreateElectionModal();
        });

        // Create election form
        document.getElementById('createElectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createElection();
        });

        // Add candidate form
        document.getElementById('addCandidateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCandidate();
        });

        // Election management buttons
        document.getElementById('addCandidateBtn').addEventListener('click', () => {
            this.showAddCandidateModal();
        });

        document.getElementById('startVotingBtn').addEventListener('click', () => {
            this.startVoting();
        });

        document.getElementById('endVotingBtn').addEventListener('click', () => {
            this.endVoting();
        });
    }

    // Election Management
    createElection() {
        const name = document.getElementById('electionName').value.trim();
        const description = document.getElementById('electionDescription').value.trim();

        if (!name) {
            alert('กรุณาใส่ชื่อการเลือกตั้ง');
            return;
        }

        const election = {
            id: Date.now().toString(),
            name: name,
            description: description,
            candidates: [],
            votes: {},
            status: 'setup', // setup, voting, ended
            createdAt: new Date().toISOString()
        };

        this.elections.push(election);
        this.saveElections();
        this.hideCreateElectionModal();
        this.loadElections();
        
        // Show success message
        this.showNotification('สร้างการเลือกตั้งเรียบร้อยแล้ว', 'success');
    }

    deleteElection(electionId) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบการเลือกตั้งนี้?')) {
            this.elections = this.elections.filter(e => e.id !== electionId);
            this.saveElections();
            this.loadElections();
            this.showNotification('ลบการเลือกตั้งเรียบร้อยแล้ว', 'success');
        }
    }

    openElection(electionId) {
        this.currentElection = this.elections.find(e => e.id === electionId);
        if (this.currentElection) {
            this.showElectionManagementPage();
        }
    }

    // Candidate Management
    addCandidate() {
        const name = document.getElementById('candidateName').value.trim();
        const number = parseInt(document.getElementById('candidateNumber').value);
        const party = document.getElementById('candidateParty').value.trim();

        if (!name || !number) {
            alert('กรุณาใส่ชื่อผู้สมัครและหมายเลข');
            return;
        }

        // Check if candidate number already exists
        if (this.currentElection.candidates.some(c => c.number === number)) {
            alert('หมายเลขผู้สมัครนี้มีอยู่แล้ว');
            return;
        }

        const candidate = {
            id: Date.now().toString(),
            name: name,
            number: number,
            party: party || '',
            votes: 0
        };

        this.currentElection.candidates.push(candidate);
        this.currentElection.votes[candidate.id] = 0;
        this.updateCurrentElection();
        this.hideAddCandidateModal();
        this.loadCandidates();
        this.loadResults();
        
        this.showNotification('เพิ่มผู้สมัครเรียบร้อยแล้ว', 'success');
    }

    deleteCandidate(candidateId) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้สมัครคนนี้?')) {
            this.currentElection.candidates = this.currentElection.candidates.filter(c => c.id !== candidateId);
            delete this.currentElection.votes[candidateId];
            this.updateCurrentElection();
            this.loadCandidates();
            this.loadResults();
            this.showNotification('ลบผู้สมัครเรียบร้อยแล้ว', 'success');
        }
    }

    // Voting System
    startVoting() {
        if (this.currentElection.candidates.length === 0) {
            alert('กรุณาเพิ่มผู้สมัครก่อนเริ่มการลงคะแนน');
            return;
        }

        this.currentElection.status = 'voting';
        this.votingActive = true;
        this.updateCurrentElection();
        this.loadVotingArea();
        this.showNotification('เริ่มการลงคะแนนแล้ว', 'success');
    }

    endVoting() {
        if (confirm('คุณแน่ใจหรือไม่ที่จะสิ้นสุดการลงคะแนน?')) {
            this.currentElection.status = 'ended';
            this.votingActive = false;
            this.updateCurrentElection();
            this.loadVotingArea();
            this.showNotification('สิ้นสุดการลงคะแนนแล้ว', 'info');
        }
    }

    vote(candidateId) {
        if (!this.votingActive || this.currentElection.status !== 'voting') {
            alert('การลงคะแนนไม่ได้เปิดอยู่');
            return;
        }

        this.currentElection.votes[candidateId]++;
        // Find the candidate in the currentElection.candidates array and update their votes
        const candidateIndex = this.currentElection.candidates.findIndex(c => c.id === candidateId);
        if (candidateIndex !== -1) {
            this.currentElection.candidates[candidateIndex].votes = this.currentElection.votes[candidateId];
        }
        this.updateCurrentElection();
        this.loadResults();
        this.loadVotingArea(); // Refresh voting area to show updated score
        this.showNotification("ลงคะแนนเรียบร้อยแล้ว", "success");
    }

    // UI Management
    showMainPage() {
        document.getElementById('welcomeSection').style.display = 'block';
        document.getElementById('electionsSection').style.display = 'block';
        document.getElementById('electionManagementPage').style.display = 'none';
        this.loadElections();
    }

    showElectionManagementPage() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('electionsSection').style.display = 'none';
        document.getElementById('electionManagementPage').style.display = 'block';
        
        document.getElementById('currentElectionTitle').textContent = this.currentElection.name;
        document.getElementById('currentElectionDescription').textContent = this.currentElection.description || 'ไม่มีคำอธิบาย';
        
        this.loadCandidates();
        this.loadVotingArea();
        this.loadResults();
    }

    showCreateElectionModal() {
        document.getElementById('createElectionModal').classList.remove('hidden');
        document.getElementById('createElectionModal').classList.add('flex');
        document.getElementById('createElectionForm').reset();
    }

    hideCreateElectionModal() {
        document.getElementById('createElectionModal').classList.add('hidden');
        document.getElementById('createElectionModal').classList.remove('flex');
    }

    showAddCandidateModal() {
        document.getElementById('addCandidateModal').classList.remove('hidden');
        document.getElementById('addCandidateModal').classList.add('flex');
        document.getElementById('addCandidateForm').reset();
    }

    hideAddCandidateModal() {
        document.getElementById('addCandidateModal').classList.add('hidden');
        document.getElementById('addCandidateModal').classList.remove('flex');
    }

    // Data Loading
    loadElections() {
        const electionsList = document.getElementById('electionsList');
        const noElections = document.getElementById('noElections');

        if (this.elections.length === 0) {
            electionsList.style.display = 'none';
            noElections.style.display = 'block';
            return;
        }

        electionsList.style.display = 'grid';
        noElections.style.display = 'none';

        electionsList.innerHTML = this.elections.map(election => {
            const statusBadge = this.getStatusBadge(election.status);
            const candidateCount = election.candidates.length;
            const totalVotes = Object.values(election.votes).reduce((sum, votes) => sum + votes, 0);

            return `
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 border-l-4 border-primary">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="text-lg font-semibold text-gray-800">${election.name}</h4>
                        ${statusBadge}
                    </div>
                    <p class="text-gray-600 mb-4">${election.description || 'ไม่มีคำอธิบาย'}</p>
                    <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>ผู้สมัคร: ${candidateCount} คน</span>
                        <span>คะแนนรวม: ${totalVotes} คะแนน</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-400">
                            สร้างเมื่อ: ${new Date(election.createdAt).toLocaleDateString('th-TH')}
                        </span>
                        <div class="flex space-x-2">
                            <button onclick="electionSystem.openElection('${election.id}')" 
                                    class="bg-primary hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200">
                                จัดการ
                            </button>
                            <button onclick="electionSystem.deleteElection('${election.id}')" 
                                    class="bg-danger hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200">
                                ลบ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadCandidates() {
        const candidatesList = document.getElementById('candidatesList');
        const noCandidates = document.getElementById('noCandidates');

        if (this.currentElection.candidates.length === 0) {
            candidatesList.style.display = 'none';
            noCandidates.style.display = 'block';
            return;
        }

        candidatesList.style.display = 'grid';
        noCandidates.style.display = 'none';

        candidatesList.innerHTML = this.currentElection.candidates
            .sort((a, b) => a.number - b.number)
            .map(candidate => {
                const votes = this.currentElection.votes[candidate.id] || 0;
                return `
                    <div class="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-secondary transition-colors duration-200">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center">
                                <span class="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                                    ${candidate.number}
                                </span>
                                <div>
                                    <h5 class="font-semibold text-gray-800">${candidate.name}</h5>
                                    ${candidate.party ? `<p class="text-sm text-gray-600">${candidate.party}</p>` : ''}
                                </div>
                            </div>
                            <button onclick="electionSystem.deleteCandidate('${candidate.id}')" 
                                    class="text-danger hover:text-red-700 text-sm transition-colors duration-200">
                                ลบ
                            </button>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-bold text-primary">${votes} คะแนน</span>
                        </div>
                    </div>
                `;
            }).join('');
    }

    loadVotingArea() {
        const votingArea = document.getElementById('votingArea');
        const votingNotStarted = document.getElementById('votingNotStarted');
        const votingCandidates = document.getElementById('votingCandidates');

        if (this.currentElection.status === 'setup') {
            votingArea.style.display = 'none';
            votingNotStarted.style.display = 'block';
            return;
        }

        votingArea.style.display = 'block';
        votingNotStarted.style.display = 'none';

        if (this.currentElection.candidates.length === 0) {
            votingCandidates.innerHTML = '<p class="text-gray-500 text-center col-span-full">ไม่มีผู้สมัคร</p>';
            return;
        }

        votingCandidates.innerHTML = this.currentElection.candidates
            .sort((a, b) => a.number - b.number)
            .map(candidate => {
                const votes = this.currentElection.votes[candidate.id] || 0;
                const isVotingActive = this.currentElection.status === 'voting';
                
                return `
                    <div class="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-primary transition-all duration-200 text-center">
                        <div class="mb-4">
                            <div class="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                                ${candidate.number}
                            </div>
                            <h5 class="font-semibold text-gray-800 mb-1">${candidate.name}</h5>
                            ${candidate.party ? `<p class="text-sm text-gray-600 mb-3">${candidate.party}</p>` : '<div class="mb-3"></div>'}
                        </div>
                        <div class="mb-4">
                            <span class="text-2xl font-bold text-primary">${votes}</span>
                            <p class="text-sm text-gray-600">คะแนน</p>
                        </div>
                        ${isVotingActive ? `
                            <button onclick="electionSystem.vote('${candidate.id}')" 
                                    class="w-full bg-secondary hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 pulse-animation">
                                ลงคะแนน
                            </button>
                        ` : `
                            <div class="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg font-medium">
                                ${this.currentElection.status === 'ended' ? 'การลงคะแนนสิ้นสุดแล้ว' : 'รอการเริ่มลงคะแนน'}
                            </div>
                        `}
                    </div>
                `;
            }).join('');
    }

    loadResults() {
        const resultsArea = document.getElementById('resultsArea');
        
        if (this.currentElection.candidates.length === 0) {
            resultsArea.innerHTML = '<p class="text-gray-500 text-center">ไม่มีผู้สมัคร</p>';
            return;
        }

        const totalVotes = Object.values(this.currentElection.votes).reduce((sum, votes) => sum + votes, 0);
        const sortedCandidates = this.currentElection.candidates
            .map(candidate => ({
                ...candidate,
                votes: this.currentElection.votes[candidate.id] || 0,
                percentage: totalVotes > 0 ? ((this.currentElection.votes[candidate.id] || 0) / totalVotes * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.votes - a.votes);

        resultsArea.innerHTML = `
            <div class="mb-6">
                <div class="text-center mb-4">
                    <span class="text-3xl font-bold text-primary">${totalVotes}</span>
                    <p class="text-gray-600">คะแนนรวมทั้งหมด</p>
                </div>
            </div>
            <div class="space-y-4">
                ${sortedCandidates.map((candidate, index) => `
                    <div class="bg-gray-50 rounded-lg p-4 ${index === 0 && candidate.votes > 0 ? 'border-2 border-accent bg-yellow-50' : ''}">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center">
                                ${index === 0 && candidate.votes > 0 ? '<span class="text-2xl mr-2">🏆</span>' : ''}
                                <span class="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                                    ${candidate.number}
                                </span>
                                <div>
                                    <h5 class="font-semibold text-gray-800">${candidate.name}</h5>
                                    ${candidate.party ? `<p class="text-sm text-gray-600">${candidate.party}</p>` : ''}
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-xl font-bold text-primary">${candidate.votes}</span>
                                <span class="text-sm text-gray-600 ml-1">คะแนน</span>
                                <p class="text-sm text-gray-500">${candidate.percentage}%</p>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="bg-primary h-3 rounded-full transition-all duration-500" 
                                 style="width: ${candidate.percentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Utility Functions
    getStatusBadge(status) {
        const badges = {
            'setup': '<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">เตรียมการ</span>',
            'voting': '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">กำลังลงคะแนน</span>',
            'ended': '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">สิ้นสุดแล้ว</span>'
        };
        return badges[status] || badges['setup'];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'info': 'bg-blue-500',
            'warning': 'bg-yellow-500'
        };

        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    updateCurrentElection() {
        const index = this.elections.findIndex(e => e.id === this.currentElection.id);
        if (index !== -1) {
            this.elections[index] = this.currentElection;
            this.saveElections();
        }
    }

    saveElections() {
        localStorage.setItem('elections', JSON.stringify(this.elections));
    }
}

// Global functions for HTML onclick events
function showCreateElectionModal() {
    electionSystem.showCreateElectionModal();
}

function hideCreateElectionModal() {
    electionSystem.hideCreateElectionModal();
}

function showAddCandidateModal() {
    electionSystem.showAddCandidateModal();
}

function hideAddCandidateModal() {
    electionSystem.hideAddCandidateModal();
}

function showMainPage() {
    electionSystem.showMainPage();
}

// Initialize the system when page loads
let electionSystem;
document.addEventListener('DOMContentLoaded', () => {
    electionSystem = new ElectionSystem();
});

// Auto-refresh results every 2 seconds when voting is active
setInterval(() => {
    if (electionSystem && electionSystem.currentElection && electionSystem.currentElection.status === 'voting') {
        electionSystem.loadResults();
        electionSystem.loadVotingArea();
    }
}, 2000);

