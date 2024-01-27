export interface IUpload {
	type: 'file' | 'text';
	content?: string;
	duration: string;
	file?: {
		name: string;
		size: number;
		contentType: string;
	};
	email: string;
}
