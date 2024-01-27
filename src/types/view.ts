export interface IView {
	type: 'file' | 'text';
	content?: string;
	file?: {
		name: string;
		size: number;
		contentType: string;
	};
	url?: string;
}
