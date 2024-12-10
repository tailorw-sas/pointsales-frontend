export interface ITreeNode {
    key: string;
    data: {
        name: string;
        type: string;
    };
    children?: ITreeNode[];
}

