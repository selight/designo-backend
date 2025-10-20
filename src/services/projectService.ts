import Project, { IProject, ISceneObject, ICamera } from '../models/Project';
import User from '../models/User';

export interface CreateProjectData {
  title: string;
  ownerId?: string;
}

export interface UpdateProjectData {
  objects?: ISceneObject[];
  camera?: ICamera;
}


export class ProjectService {
  /**
   * Get all projects of a userwith basic information
   */
  async getProjectsByUserId(userId: string): Promise<IProject[]> {
    try {
      const projects = await Project.find({ ownerId: userId })
        .select('title createdAt updatedAt')
        .sort({ updatedAt: -1 });
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }
  /**
   * Get a specific project with full scene data
   */
  async getProjectById(projectId: string): Promise<IProject | null> {
    try {
      const project = await Project.findById(projectId)
        .populate('objects.userId', 'name color');
      
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<IProject> {
    try {
      const { title, ownerId } = data;
      
      if (!title) {
        throw new Error('Title is required');
      }
      
      const project = new Project({
        title,
        ownerId,
        objects: [],
        camera: {
          position: [8, 6, 8],
          target: [0, 0, 0]
        }
      });
      
      await project.save();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  /**
   * Update a project (autosave)
   */
  async updateProject(projectId: string, data: UpdateProjectData): Promise<IProject | null> {
    try {
      const updateData: Partial<IProject> = {
        updatedAt: new Date()
      };
      
      if (data.objects) updateData.objects = data.objects;
      if (data.camera) updateData.camera = data.camera;
      
      const project = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true, runValidators: true }
      ).populate('objects.userId', 'name color');
      
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const result = await Project.findByIdAndDelete(projectId);
      return !!result;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }


  /**
   * Add an object to a project
   */
  async addObject(projectId: string, object: ISceneObject): Promise<boolean> {
    try {
      const result = await Project.findByIdAndUpdate(
        projectId,
        { $push: { objects: object } },
        { new: true }
      );
      
      return !!result;
    } catch (error) {
      console.error('Error adding object:', error);
      throw new Error('Failed to add object');
    }
  }

  /**
   * Update an object in a project
   */
  async updateObject(projectId: string, objectId: string, object: ISceneObject): Promise<boolean> {
    try {
      const result = await Project.findByIdAndUpdate(
        projectId,
        { $set: { 'objects.$[elem]': object } },
        { arrayFilters: [{ 'elem.id': objectId }], new: true }
      );
      
      return !!result;
    } catch (error) {
      console.error('Error updating object:', error);
      throw new Error('Failed to update object');
    }
  }

  /**
   * Delete an object from a project
   */
  async deleteObject(projectId: string, objectId: string): Promise<boolean> {
    try {
      const result = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { objects: { id: objectId } } },
        { new: true }
      );
      
      return !!result;
    } catch (error) {
      console.error('Error deleting object:', error);
      throw new Error('Failed to delete object');
    }
  }

  /**
   * Update camera position for a project
   */
  async updateCamera(projectId: string, camera: ICamera): Promise<boolean> {
    try {
      const result = await Project.findByIdAndUpdate(
        projectId,
        { $set: { camera } },
        { new: true }
      );
      
      return !!result;
    } catch (error) {
      console.error('Error updating camera:', error);
      throw new Error('Failed to update camera');
    }
  }

  /**
   * Enable sharing for a project
   */
  async enableSharing(projectId: string, ownerId: string): Promise<IProject | null> {
    try {
      const project = await Project.findOneAndUpdate(
        { _id: projectId, ownerId },
        { shared: true },
        { new: true }
      );
      return project;
    } catch (error) {
      console.error('Error enabling sharing:', error);
      throw new Error('Failed to enable sharing');
    }
  }

  /**
   * Disable sharing for a project
   */
  async disableSharing(projectId: string, ownerId: string): Promise<IProject | null> {
    try {
      const project = await Project.findOneAndUpdate(
        { _id: projectId, ownerId },
        { shared: false, sharedWith: [] },
        { new: true }
      );
      return project;
    } catch (error) {
      console.error('Error disabling sharing:', error);
      throw new Error('Failed to disable sharing');
    }
  }

  /**
   * Check if a project is shared and accessible
   */
  async isProjectShared(projectId: string): Promise<boolean> {
    try {
      const project = await Project.findById(projectId);
      return project ? project.shared : false;
    } catch (error) {
      console.error('Error checking project sharing status:', error);
      return false;
    }
  }

  /**
   * Get a shared project (for collaboration)
   */
  async getSharedProject(projectId: string): Promise<IProject | null> {
    try {
      const project = await Project.findOne({
        _id: projectId,
        shared: true
      }).populate('objects.userId', 'name color');
      
      return project;
    } catch (error) {
      console.error('Error getting shared project:', error);
      throw new Error('Failed to get shared project');
    }
  }
}

export const projectService = new ProjectService();
