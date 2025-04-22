class IdeaService {
  constructor() {
    this.ideas = [];
  }

  getAllIdeas() {
    return this.ideas;
  }

  getActiveIdeas() {
    // Filter out any notes that are archived
    return this.getAllIdeas().filter(idea => !idea.archived);
  }

  addIdea(idea) {
    this.ideas.push(idea);
  }

  removeIdea(id) {
    this.ideas = this.ideas.filter(idea => idea.id !== id);
  }
}

module.exports = IdeaService;