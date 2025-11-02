import { useState, useCallback } from "react";

export interface FileObject {
	id: string;
	file: File;
	preview?: string;
}

interface UseFileUploadProps {
	accept?: string;
	maxSize?: number;
	multiple?: boolean;
	maxFiles?: number;
	initialFiles?: FileObject[];
}

interface UseFileUploadReturn {
	files: FileObject[];
	isDragging: boolean;
	errors: string[];
	handleDragEnter: (e: React.DragEvent) => void;
	handleDragLeave: (e: React.DragEvent) => void;
	handleDragOver: (e: React.DragEvent) => void;
	handleDrop: (e: React.DragEvent) => void;
	openFileDialog: () => void;
	removeFile: (id: string) => void;
	clearFiles: () => void;
	getInputProps: () => {
		type: string;
		accept: string;
		multiple: boolean;
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		className: string;
		"aria-label": string;
	};
}

export function useFileUpload({
	accept = "",
	maxSize = Infinity,
	multiple = false,
	maxFiles = Infinity,
	initialFiles = [],
}: UseFileUploadProps): UseFileUploadReturn {
	const [files, setFiles] = useState<FileObject[]>(initialFiles);
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const validateFiles = useCallback(
		(fileList: FileList): { validFiles: File[]; newErrors: string[] } => {
			const validFiles: File[] = [];
			const newErrors: string[] = [];

			// Check max files limit
			if (!multiple && fileList.length > 1) {
				newErrors.push("Only one file is allowed");
				return { validFiles, newErrors };
			}

			if (files.length + fileList.length > maxFiles) {
				newErrors.push(`Maximum ${maxFiles} files allowed`);
				return { validFiles, newErrors };
			}

			Array.from(fileList).forEach((file) => {
				// Check file type
				if (
					accept &&
					!accept.split(",").some((type) => {
						const trimmedType = type.trim();
						if (trimmedType.startsWith(".")) {
							return file.name
								.toLowerCase()
								.endsWith(trimmedType.toLowerCase());
						}
						return file.type.match(new RegExp(trimmedType.replace("*", ".*")));
					})
				) {
					newErrors.push(`Invalid file type: ${file.name}`);
					return;
				}

				// Check file size
				if (file.size > maxSize) {
					newErrors.push(`File too large: ${file.name}`);
					return;
				}

				validFiles.push(file);
			});

			return { validFiles, newErrors };
		},
		[accept, maxSize, multiple, maxFiles, files.length],
	);

	const createFileObject = useCallback((file: File): FileObject => {
		const id = `${file.name}-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;
		const fileObject: FileObject = { id, file };

		// Create preview for images
		if (file.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onload = () => {
				fileObject.preview = reader.result as string;
			};
			reader.readAsDataURL(file);
		}

		return fileObject;
	}, []);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const { validFiles, newErrors } = validateFiles(e.dataTransfer.files);
			setErrors(newErrors);

			if (validFiles.length > 0) {
				const newFileObjects = validFiles.map(createFileObject);
				setFiles((prev) =>
					multiple ? [...prev, ...newFileObjects] : newFileObjects,
				);
			}
		},
		[validateFiles, createFileObject, multiple],
	);

	const openFileDialog = useCallback(() => {
		const input = document.querySelector(
			'input[type="file"][aria-label="Upload file"]',
		) as HTMLInputElement;
		input?.click();
	}, []);

	const removeFile = useCallback((id: string) => {
		setFiles((prev) => prev.filter((file) => file.id !== id));
		setErrors([]);
	}, []);

	const clearFiles = useCallback(() => {
		setFiles([]);
		setErrors([]);
	}, []);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { validFiles, newErrors } = validateFiles(
				e.target.files || new DataTransfer().files,
			);
			setErrors(newErrors);

			if (validFiles.length > 0) {
				const newFileObjects = validFiles.map(createFileObject);
				setFiles((prev) =>
					multiple ? [...prev, ...newFileObjects] : newFileObjects,
				);
			}

			// Reset input
			e.target.value = "";
		},
		[validateFiles, createFileObject, multiple],
	);

	const getInputProps = useCallback(
		() => ({
			type: "file" as const,
			accept,
			multiple,
			onChange: handleFileInputChange,
			className: "sr-only",
			"aria-label": "Upload file",
		}),
		[accept, multiple, handleFileInputChange],
	);

	return {
		files,
		isDragging,
		errors,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		openFileDialog,
		removeFile,
		clearFiles,
		getInputProps,
	};
}

export function formatBytes(bytes: number, decimals: number = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
