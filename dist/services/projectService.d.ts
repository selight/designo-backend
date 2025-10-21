import { IProject, ISceneObject, ICamera } from '../models/Project';
export interface CreateProjectData {
    title: string;
    ownerId?: string;
}
export interface UpdateProjectData {
    objects?: ISceneObject[];
    camera?: ICamera;
}
export declare class ProjectService {
    /**
     * Get all projects of a userwith basic information
     */
    getProjectsByUserId(userId: string): Promise<IProject[]>;
    /**
     * Get a specific project with full scene data
     */
    getProjectById(projectId: string): Promise<IProject | null>;
    /**
     * Create a new project
     */
    createProject(data: CreateProjectData): Promise<IProject>;
    /**
     * Update a project (autosave)
     */
    updateProject(projectId: string, data: UpdateProjectData): Promise<IProject | null>;
    /**
     * Delete a project
     */
    deleteProject(projectId: string): Promise<boolean>;
    /**
     * Add an object to a project
     */
    addObject(projectId: string, object: ISceneObject): Promise<boolean>;
    /**
     * Update an object in a project
     */
    updateObject(projectId: string, objectId: string, object: ISceneObject): Promise<boolean>;
    /**
     * Delete an object from a project
     */
    deleteObject(projectId: string, objectId: string): Promise<boolean>;
    /**
     * Update camera position for a project
     */
    updateCamera(projectId: string, camera: ICamera): Promise<boolean>;
    /**
     * Enable sharing for a project
     */
    enableSharing(projectId: string, ownerId: string): Promise<IProject | null>;
    /**
     * Disable sharing for a project
     */
    disableSharing(projectId: string, ownerId: string): Promise<IProject | null>;
    /**
     * Check if a project is shared and accessible
     */
    isProjectShared(projectId: string): Promise<boolean>;
    /**
     * Get a shared project (for collaboration)
     */
    getSharedProject(projectId: string): Promise<IProject | null>;
}
export declare const projectService: ProjectService;
//# sourceMappingURL=projectService.d.ts.map