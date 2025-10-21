"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const Project_1 = __importDefault(require("../models/Project"));
class ProjectService {
    /**
     * Get all projects of a userwith basic information
     */
    async getProjectsByUserId(userId) {
        try {
            const projects = await Project_1.default.find({ ownerId: userId })
                .select('title createdAt updatedAt')
                .sort({ updatedAt: -1 });
            return projects;
        }
        catch (error) {
            console.error('Error fetching projects:', error);
            throw new Error('Failed to fetch projects');
        }
    }
    /**
     * Get a specific project with full scene data
     */
    async getProjectById(projectId) {
        try {
            const project = await Project_1.default.findById(projectId)
                .populate('objects.userId', 'name color');
            return project;
        }
        catch (error) {
            console.error('Error fetching project:', error);
            throw new Error('Failed to fetch project');
        }
    }
    /**
     * Create a new project
     */
    async createProject(data) {
        try {
            const { title, ownerId } = data;
            if (!title) {
                throw new Error('Title is required');
            }
            const project = new Project_1.default({
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
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw new Error('Failed to create project');
        }
    }
    /**
     * Update a project (autosave)
     */
    async updateProject(projectId, data) {
        try {
            const updateData = {
                updatedAt: new Date()
            };
            if (data.objects)
                updateData.objects = data.objects;
            if (data.camera)
                updateData.camera = data.camera;
            const project = await Project_1.default.findByIdAndUpdate(projectId, updateData, { new: true, runValidators: true }).populate('objects.userId', 'name color');
            return project;
        }
        catch (error) {
            console.error('Error updating project:', error);
            throw new Error('Failed to update project');
        }
    }
    /**
     * Delete a project
     */
    async deleteProject(projectId) {
        try {
            const result = await Project_1.default.findByIdAndDelete(projectId);
            return !!result;
        }
        catch (error) {
            console.error('Error deleting project:', error);
            throw new Error('Failed to delete project');
        }
    }
    /**
     * Add an object to a project
     */
    async addObject(projectId, object) {
        try {
            const result = await Project_1.default.findByIdAndUpdate(projectId, { $push: { objects: object } }, { new: true });
            return !!result;
        }
        catch (error) {
            console.error('Error adding object:', error);
            throw new Error('Failed to add object');
        }
    }
    /**
     * Update an object in a project
     */
    async updateObject(projectId, objectId, object) {
        try {
            const result = await Project_1.default.findByIdAndUpdate(projectId, { $set: { 'objects.$[elem]': object } }, { arrayFilters: [{ 'elem.id': objectId }], new: true });
            return !!result;
        }
        catch (error) {
            console.error('Error updating object:', error);
            throw new Error('Failed to update object');
        }
    }
    /**
     * Delete an object from a project
     */
    async deleteObject(projectId, objectId) {
        try {
            const result = await Project_1.default.findByIdAndUpdate(projectId, { $pull: { objects: { id: objectId } } }, { new: true });
            return !!result;
        }
        catch (error) {
            console.error('Error deleting object:', error);
            throw new Error('Failed to delete object');
        }
    }
    /**
     * Update camera position for a project
     */
    async updateCamera(projectId, camera) {
        try {
            const result = await Project_1.default.findByIdAndUpdate(projectId, { $set: { camera } }, { new: true });
            return !!result;
        }
        catch (error) {
            console.error('Error updating camera:', error);
            throw new Error('Failed to update camera');
        }
    }
    /**
     * Enable sharing for a project
     */
    async enableSharing(projectId, ownerId) {
        try {
            const project = await Project_1.default.findOneAndUpdate({ _id: projectId, ownerId }, { shared: true }, { new: true });
            return project;
        }
        catch (error) {
            console.error('Error enabling sharing:', error);
            throw new Error('Failed to enable sharing');
        }
    }
    /**
     * Disable sharing for a project
     */
    async disableSharing(projectId, ownerId) {
        try {
            const project = await Project_1.default.findOneAndUpdate({ _id: projectId, ownerId }, { shared: false, sharedWith: [] }, { new: true });
            return project;
        }
        catch (error) {
            console.error('Error disabling sharing:', error);
            throw new Error('Failed to disable sharing');
        }
    }
    /**
     * Check if a project is shared and accessible
     */
    async isProjectShared(projectId) {
        try {
            const project = await Project_1.default.findById(projectId);
            return project ? project.shared : false;
        }
        catch (error) {
            console.error('Error checking project sharing status:', error);
            return false;
        }
    }
    /**
     * Get a shared project (for collaboration)
     */
    async getSharedProject(projectId) {
        try {
            const project = await Project_1.default.findOne({
                _id: projectId,
                shared: true
            }).populate('objects.userId', 'name color');
            return project;
        }
        catch (error) {
            console.error('Error getting shared project:', error);
            throw new Error('Failed to get shared project');
        }
    }
}
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
//# sourceMappingURL=projectService.js.map