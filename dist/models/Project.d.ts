import mongoose, { Document } from 'mongoose';
export interface ISceneObject {
    id: string;
    type: "primitive" | "stl" | "annotation";
    name: string;
    visible: boolean;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    geometryJson?: any;
    text?: string;
    normal?: [number, number, number];
    targetObjectId?: string;
    userId?: mongoose.Types.ObjectId;
    createdAt?: Date;
}
export interface ICamera {
    position: [number, number, number];
    target: [number, number, number];
}
export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    ownerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    objects: ISceneObject[];
    camera: ICamera;
    shared: boolean;
    sharedWith: mongoose.Types.ObjectId[];
}
declare const _default: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Project.d.ts.map