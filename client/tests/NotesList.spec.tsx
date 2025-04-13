import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { toBeInTheDocument, toHaveLength, toHaveAttribute } from '@testing-library/jest-dom/matchers';
import NotesList from '../components/NotesList';

// Setup MSW server
const server = setupServer(
  rest.get('http://localhost:5000/notes', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, title: 'Test Note 1', content: 'Test Content 1' },
      { id: 2, title: 'Test Note 2', content: 'Test Content 2' }
    ]));
  })
);

describe('NotesList Component', () => {
  before(() => server.listen());
  after(() => server.close());

  it('should render without errors', () => {
    render(<NotesList />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('should display notes when provided', () => {
    const notes = [
      { id: 1, title: 'Test Note 1', content: 'Test Content 1' },
      { id: 2, title: 'Test Note 2', content: 'Test Content 2' }
    ];
    render(<NotesList notes={notes} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('should handle empty notes list', () => {
    render(<NotesList notes={[]} />);
    expect(screen.getByText('No notes found')).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
    render(<NotesList />);
    // Simulate API call delay
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    server.use(
      rest.get('http://localhost:5000/notes', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }));
      })
    );
    render(<NotesList />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load notes')).toBeInTheDocument();
    });
  });

  it('should add a new note', () => {
    const notes = [
      { id: 1, title: 'Test Note 1', content: 'Test Content 1' }
    ];
    render(<NotesList notes={notes} />);
    
    // Simulate adding a new note
    const newNote = { id: 2, title: 'Test Note 2', content: 'Test Content 2' };
    const updatedNotes = [...notes, newNote];
    
    // Update the component with new notes
    render(<NotesList notes={updatedNotes} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('should delete a note', () => {
    const notes = [
      { id: 1, title: 'Test Note 1', content: 'Test Content 1' },
      { id: 2, title: 'Test Note 2', content: 'Test Content 2' }
    ];
    render(<NotesList notes={notes} />);
    
    // Simulate deleting a note
    const remainingNotes = notes.filter(note => note.id !== 2);
    
    // Update the component with remaining notes
    render(<NotesList notes={remainingNotes} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('should have proper ARIA labels', () => {
    render(<NotesList />);
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'List of notes');
  });
});