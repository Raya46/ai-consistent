import { FileObject } from "./use-file-upload";
import { extractTextFromFile } from "@/lib/pdf-utils";

export interface StoredFile {
	name: string;
	size: number;
	type: string;
	key: string;
	textContent?: string;
}

export interface FileMetadata {
	type: string;
	name: string;
	size: number;
	lastModified: number;
	fileType: string;
	count?: number;
	allFiles?: StoredFile[];
}

import { useCallback } from "react";

export const useFileStorage = () => {
	const clearAllData = useCallback(async (): Promise<void> => {
		return new Promise((resolve, reject) => {
			try {
				// Clear sessionStorage
				sessionStorage.removeItem("documentFileMeta");
				sessionStorage.removeItem("audioFileMeta");

				// Clear IndexedDB
				const dbName = "FileStorageDB";
				const storeName = "files";

				const request = indexedDB.open(dbName, 1);

				request.onsuccess = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;

					if (db.objectStoreNames.contains(storeName)) {
						const transaction = db.transaction([storeName], "readwrite");
						const store = transaction.objectStore(storeName);

						// Clear all files from the store
						store.clear();

						transaction.oncomplete = () => {
							console.log("All data cleared successfully");
							resolve();
						};

						transaction.onerror = () => {
							console.error("Error clearing IndexedDB");
							reject(new Error("Error clearing IndexedDB"));
						};
					} else {
						resolve();
					}
				};

				request.onerror = () => {
					console.error("Error opening IndexedDB for clearing");
					reject(new Error("Error opening IndexedDB for clearing"));
				};
			} catch (error) {
				console.error("Error clearing data:", error);
				reject(error);
			}
		});
	}, []);

	const storeFilesInIndexedDB = useCallback(
		async (files: FileObject[]): Promise<void> => {
			// This function should only run on the client side
			if (typeof window === "undefined") {
				return;
			}

			try {
				const dbName = "FileStorageDB";
				const storeName = "files";

				// Extract text from all files using the client-side utility
				const filesWithText = await Promise.all(
					files.map(async (fileObj) => {
						try {
							const textContent = await extractTextFromFile(fileObj.file);
							return { ...fileObj, textContent };
						} catch (error) {
							console.error(
								`Error extracting text from ${fileObj.file.name}:`,
								error,
							);
							return { ...fileObj, textContent: "" };
						}
					}),
				);

				return new Promise((resolve, reject) => {
					const request = indexedDB.open(dbName, 2);

					request.onupgradeneeded = (event) => {
						const db = (event.target as IDBOpenDBRequest).result;
						if (!db.objectStoreNames.contains(storeName)) {
							db.createObjectStore(storeName);
						}
					};

					request.onsuccess = (event) => {
						const db = (event.target as IDBOpenDBRequest).result;
						const transaction = db.transaction([storeName], "readwrite");
						const store = transaction.objectStore(storeName);

						// Clear existing files first to prevent redundancy
						store.clear();

						// Store all files with unique keys
						filesWithText.forEach((fileObj, index: number) => {
							const storeKey = `uploadedDocument_${index}`;
							store.put(fileObj.file, storeKey);

							// Also store the first file with the original key for compatibility
							if (index === 0) {
								store.put(fileObj.file, "uploadedDocument");
							}
						});

						transaction.oncomplete = () => {
							// Store file metadata in sessionStorage for all files
							if (filesWithText.length > 0) {
								const filesData: StoredFile[] = filesWithText.map(
									(fileObj, index) => ({
										name: fileObj.file.name,
										size: fileObj.file.size,
										type: fileObj.file.type,
										key: `uploadedDocument_${index}`,
										textContent: fileObj.textContent,
									}),
								);

								const firstFile = filesWithText[0].file;
								const fileData: FileMetadata = {
									type: firstFile.type,
									name: firstFile.name,
									size: firstFile.size,
									lastModified: firstFile.lastModified,
									fileType: "document",
									count: filesWithText.length,
									allFiles: filesData,
								};
								sessionStorage.setItem(
									"documentFileMeta",
									JSON.stringify(fileData),
								);
							}
							resolve();
						};

						transaction.onerror = () => {
							console.error("Error storing files in IndexedDB");
							reject(new Error("Error storing files in IndexedDB"));
						};
					};

					request.onerror = () => {
						console.error("Error opening IndexedDB");
						reject(new Error("Error opening IndexedDB"));
					};
				});
			} catch (error) {
				console.error("Error in storeFilesInIndexedDB:", error);
				throw error;
			}
		},
		[],
	);

	const storeAudioFile = useCallback(async (file: File): Promise<void> => {
		return new Promise((resolve, reject) => {
			try {
				const dbName = "FileStorageDB";
				const storeName = "files";

				const request = indexedDB.open(dbName, 2);

				request.onupgradeneeded = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;
					if (!db.objectStoreNames.contains(storeName)) {
						db.createObjectStore(storeName);
					}
				};

				request.onsuccess = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;
					const transaction = db.transaction([storeName], "readwrite");
					const store = transaction.objectStore(storeName);

					store.put(file, "uploadedAudio");

					transaction.oncomplete = () => {
						// Store audio file metadata in sessionStorage
						const fileData: FileMetadata = {
							type: file.type,
							name: file.name,
							size: file.size,
							lastModified: file.lastModified,
							fileType: "audio",
						};
						sessionStorage.setItem("audioFileMeta", JSON.stringify(fileData));
						resolve();
					};

					transaction.onerror = () => {
						console.error("Error storing audio file in IndexedDB");
						reject(new Error("Error storing audio file in IndexedDB"));
					};
				};

				request.onerror = () => {
					console.error("Error opening IndexedDB");
					reject(new Error("Error opening IndexedDB"));
				};
			} catch (error) {
				console.error("Error processing audio file:", error);
				reject(error);
			}
		});
	}, []);

	const storeAudioFiles = useCallback(
		async (files: FileObject[]): Promise<void> => {
			return new Promise((resolve, reject) => {
				try {
					const dbName = "FileStorageDB";
					const storeName = "files";

					// Open IndexedDB
					const request = indexedDB.open(dbName, 2);

					request.onupgradeneeded = (event) => {
						const db = (event.target as IDBOpenDBRequest).result;
						if (!db.objectStoreNames.contains(storeName)) {
							db.createObjectStore(storeName);
						}
					};

					request.onsuccess = (event) => {
						const db = (event.target as IDBOpenDBRequest).result;
						const transaction = db.transaction([storeName], "readwrite");
						const store = transaction.objectStore(storeName);

						// Clear existing audio files first
						// Clear all audio-related keys
						const audioKeys = ["uploadedAudio"];
						for (let i = 0; i < 10; i++) {
							audioKeys.push(`uploadedAudio_${i}`);
						}

						audioKeys.forEach((key) => {
							const deleteRequest = store.delete(key);
							deleteRequest.onerror = () => {
								console.warn(`Failed to delete key ${key}`);
							};
						});

						// Store all audio files with unique keys
						files.forEach((fileObj, index: number) => {
							const storeKey = `uploadedAudio_${index}`;
							store.put(fileObj.file, storeKey);

							// Also store the first file with the original key for compatibility
							if (index === 0) {
								store.put(fileObj.file, "uploadedAudio");
							}
						});

						transaction.oncomplete = () => {
							// Store audio files metadata in sessionStorage for all files
							if (files.length > 0) {
								const filesData: StoredFile[] = files.map((fileObj, index) => ({
									name: fileObj.file.name,
									size: fileObj.file.size,
									type: fileObj.file.type,
									key: `uploadedAudio_${index}`,
								}));

								const firstFile = files[0].file;
								const fileData: FileMetadata = {
									type: firstFile.type,
									name: firstFile.name,
									size: firstFile.size,
									lastModified: firstFile.lastModified,
									fileType: "audio",
									count: files.length,
									allFiles: filesData,
								};
								sessionStorage.setItem(
									"audioFileMeta",
									JSON.stringify(fileData),
								);
							}
							resolve();
						};

						transaction.onerror = () => {
							console.error("Error storing audio files in IndexedDB");
							reject(new Error("Error storing audio files in IndexedDB"));
						};
					};

					request.onerror = () => {
						console.error("Error opening IndexedDB");
						reject(new Error("Error opening IndexedDB"));
					};
				} catch (error) {
					console.error("Error storing audio files:", error);
					reject(error);
				}
			});
		},
		[],
	);

	const getFileFromIndexedDB = useCallback(
		async (key: string): Promise<File | null> => {
			return new Promise((resolve, reject) => {
				try {
					const dbName = "FileStorageDB";
					const storeName = "files";

					const request = indexedDB.open(dbName, 2);

					request.onsuccess = (event) => {
						const db = (event.target as IDBOpenDBRequest).result;
						const transaction = db.transaction([storeName], "readonly");
						const store = transaction.objectStore(storeName);

						const getRequest = store.get(key);

						getRequest.onsuccess = () => {
							const file = getRequest.result;
							resolve(file || null);
						};

						getRequest.onerror = () => {
							console.error(`Error retrieving file with key ${key}`);
							reject(new Error(`Error retrieving file with key ${key}`));
						};
					};

					request.onerror = () => {
						console.error("Error opening IndexedDB");
						reject(new Error("Error opening IndexedDB"));
					};
				} catch (error) {
					console.error("Error getting file:", error);
					reject(error);
				}
			});
		},
		[],
	);

	return {
		clearAllData,
		storeFilesInIndexedDB,
		storeAudioFile,
		storeAudioFiles,
		getFileFromIndexedDB,
	};
};
