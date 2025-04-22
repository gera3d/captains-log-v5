import React, { Component } from 'react';
import IdeaService from '../services/IdeaService';

class IdeasList extends Component {
  constructor(props) {
    super(props);
    this.ideaService = new IdeaService();
    this.state = {
      ideas: []
    };
  }

  componentDidMount() {
    // Make sure we're only getting non-archived ideas
    this.setState({
      ideas: this.ideaService.getActiveIdeas()
    });
  }

  render() {
    const { ideas } = this.state;

    return (
      <div>
        <h1>Ideas List</h1>
        <ul>
          {ideas.map((idea, index) => (
            <li key={index}>{idea.title}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default IdeasList;