"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SceneObjectSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ['primitive', 'stl', 'annotation'], required: true },
    name: { type: String, required: true },
    visible: { type: Boolean, default: false },
    position: { type: [Number], required: true, validate: [(array) => array.length === 3, 'Position must have 3 coordinates'] },
    rotation: { type: [Number], required: true, validate: [(array) => array.length === 3, 'Rotation must have 3 coordinates'] },
    scale: { type: [Number], required: true, validate: [(array) => array.length === 3, 'Scale must have 3 coordinates'] },
    geometryJson: { type: mongoose_1.Schema.Types.Mixed },
    // Annotation-specific fields
    text: { type: String },
    normal: { type: [Number], validate: [(array) => !array || array === null || array === undefined || (Array.isArray(array) && array.length <= 3), 'Normal must have at most 3 coordinates'] },
    targetObjectId: { type: String },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });
const CameraSchema = new mongoose_1.Schema({
    position: { type: [Number], required: true, validate: [(array) => array.length === 3, 'Position must have 3 coordinates'] },
    target: { type: [Number], required: true, validate: [(array) => array.length === 3, 'Target must have 3 coordinates'] }
}, { _id: false });
const ProjectSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    objects: [SceneObjectSchema],
    camera: {
        type: CameraSchema,
        default: () => ({
            position: [8, 6, 8],
            target: [0, 0, 0]
        })
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    shared: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }]
});
// Update the updatedAt field before saving
ProjectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.default = mongoose_1.default.model('Project', ProjectSchema);
//# sourceMappingURL=Project.js.map