import { Socket } from 'socket.io-client';
declare const socket: Socket;
export declare const joinProject: (projectId: string, userName?: string) => void;
export declare const broadcastCameraMove: (position: [number, number, number], target: [number, number, number]) => void;
export declare const broadcastObjectChange: (action: "add" | "update" | "delete", object?: any, objectId?: string) => void;
export declare const broadcastAnnotationChange: (action: "add" | "update" | "delete", annotation?: any, annotationId?: string) => void;
export declare const sendChatMessage: (message: string) => void;
export declare const broadcastCursorMove: (x: number, y: number) => void;
export declare const api: {
    getProjects: () => Promise<unknown>;
    getProject: (projectId: string) => Promise<unknown>;
    createProject: (title: string, ownerId?: string) => Promise<unknown>;
    updateProject: (projectId: string, data: any) => Promise<unknown>;
    deleteProject: (projectId: string) => Promise<unknown>;
    addAnnotation: (projectId: string, annotation: any) => Promise<unknown>;
    deleteAnnotation: (projectId: string, annotationId: string) => Promise<unknown>;
};
export default socket;
//# sourceMappingURL=client-example.d.ts.map