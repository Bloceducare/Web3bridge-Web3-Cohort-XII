# Web3bridge Web3 Cohort XII - GitHub Contribution Guide

Welcome to the Web3Bridge Cohort XII training program! This repository is used for submitting tasks, tracking student progress, and grading assessments. Follow this guide to ensure a smooth contribution process.

---

## For Students: Submitting Your Tasks

### 1. Fork the Repository

Create a personal copy of this repository on your GitHub account.

- Visit the repository page: [Web3bridge-Web3-Cohort-XII](https://github.com/Bloceducare/Web3bridge-Web3-Cohort-XII)
- Click the "Fork" button at the top right of the page.

### 2. Clone Your Forked Repository

Download your forked repository to your local machine:

```bash
git clone https://github.com/<your_username>/Web3bridge-Web3-Cohort-XII
cd Web3bridge-Web3-Cohort-XII
```

### 3. Sync Your Repository Regularly

Keep your fork updated with the latest changes from the main repository:

```bash
git remote add upstream https://github.com/Bloceducare/Web3bridge-Web3-Cohort-XII
git pull upstream master
git push origin master
```

### 4. Navigate to the Correct Submission Folder

Tasks are categorized by week and day. Navigate to the appropriate folder:

```bash
cd submissions/week-<week_number>/day-<day_number>
```

Example:

```bash
cd submissions/week-1/day-1
```

### 5. Create Your Personal Folder

Each student should create a folder using their registered name and project name:

```bash
mkdir <your_name>-<project_name>
```

Example:

```bash
mkdir JohnDoe-Merkle-Tree
```

### 6. Add Your Task Files

Place your task files inside your folder. Ensure proper documentation and organization.

### 7. Commit and Push Your Changes

Save your changes and push them to your forked repository:

```bash
git add .
git commit -m "Add Week <week_number> Day <day_number> task for <your_name> <project_name>"
git push origin main
```

Example:

```bash
git add .
git commit -m "Add Week 1 Day 1 task for JohnDoe Merkle Tree"
git push origin main
```

### 8. Create a Pull Request

- Go to the original GitHub repository in your browser: [Web3bridge-Web3-Cohort-XII](https://github.com/Bloceducare/Web3bridge-Web3-Cohort-XII).
- Click on the Pull Requests tab.
- Click New Pull Request and select "Compare across forks" if needed.
- Select your forked repository and branch as the source, and the master branch of the original repository as the destination.
- Provide a descriptive title and include details about your project in the description.

Example PR Title:

```bash
Add Week 1 Day 1 task for JohnDoe Merkle Tree
```

### 9. Wait for Review

Mentors may leave comments or request changes. Make updates accordingly and push again.

---

## Additional Notes

- Ensure your project is complete, well-documented, and functional before submitting.
- Follow the repository's coding and folder structure guidelines.
- Create a new folder each week and place all files and assets related to that week's project in the folder.
- PRs should have meaningful descriptions.
- Regularly sync the repository to get the latest updates.
- If you encounter any issues, contact your training facilitator for help.

## For Mentors: Managing Tasks

### 1. Adding Tasks

- Navigate to the **tasks/week-<week_number>/** folder.
- Create a markdown file named `Day-<day_number>-task.md`.
- Provide clear instructions and expectations.
- Commit and push your changes.

Example:

```bash
git add tasks/week-1/Day-1-task.md
git commit -m "Add Week 1 Day 1 Merkle Tree Task"
git push origin main
```

### 2. Preparing the Submission Folder

- Navigate to the **submissions/week-<week_number>/** folder.
- If a task is given for a specific day, create a corresponding **day subfolder** (`day-<day_number>/`).
- Example:
  submissions/week-3/day-2/

- Students will submit inside this subfolder using their **Registered Name** and **Project Name** as their personal directory.
- Example:
  submissions/week-3/day-2/JohnDoe-Merkle-Tree/

### 3. Reviewing Student Submissions

- Check the Pull Requests (PRs) tab on GitHub.
- Open a PR and review the student’s work.
- Leave comments for corrections if needed.
- Approve the PR if it meets expectations.
- Merge the PR after approval.

Thank you for contributing to Web3Bridge Cohort XII! Happy coding!
