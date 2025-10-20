import express, { Request, Response } from 'express';
import { projectService } from '../services/projectService';

const router = express.Router();

// GET /api/projects - List all projects of a User
router.get('/', async (req: Request, res: Response) => {
  try {
    const ownerId = req.query.ownerId as string;
    const projects = await projectService.getProjectsByUserId(ownerId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch projects' });
  }
});


// GET /api/projects/:id - Get specific project with full scene data
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Annotations are now stored directly in the objects array
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, ownerId } = req.body;
    
    const project = await projectService.createProject({ title, ownerId });
    res.status(201).json(project);
  } catch (error) {
    const statusCode = error instanceof Error && error.message === 'Title is required' ? 400 : 500;
    res.status(statusCode).json({ error: error instanceof Error ? error.message : 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project (autosave)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { objects, camera } = req.body;
    
    const project = await projectService.updateProject(req.params.id, {
      objects,
      camera
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await projectService.deleteProject(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete project' });
  }
});

// POST /api/projects/:id/share - Enable sharing for a project
router.post('/:id/share', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.body;
    
    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }
    
    const project = await projectService.enableSharing(req.params.id, ownerId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owned by user' });
    }
    
    res.json({ message: 'Project sharing enabled', shared: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to enable sharing' });
  }
});

// DELETE /api/projects/:id/share - Disable sharing for a project
router.delete('/:id/share', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.body;
    
    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }
    
    const project = await projectService.disableSharing(req.params.id, ownerId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owned by user' });
    }
    
    res.json({ message: 'Project sharing disabled', shared: false });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to disable sharing' });
  }
});

// GET /api/projects/:id/shared - Get shared project (for collaboration)
router.get('/:id/shared', async (req: Request, res: Response) => {
  try {
    const project = await projectService.getSharedProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Shared project not found or not shared' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch shared project' });
  }
});

export default router;
