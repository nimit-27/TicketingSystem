import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

interface FileUploadProps {
    maxSizeMB: number;
    thumbnailSize?: number;
    onFilesChange?: (files: File[]) => void;
    attachments?: File[];
    hideUploadButton?: boolean;
}

interface ThumbnailListProps {
    attachments: (File | string)[];
    thumbnailSize?: number;
    onRemove?: (index: number) => void;
}

interface ThumbnailProps {
    file: File | string;
    size: number;
    onClick: () => void;
    onRemove?: () => void;
}

const bytesToMB = (bytes: number) => bytes / (1024 * 1024);
const SUPPORTED_EXTENSIONS: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const SUPPORTED_EXTENSIONS_TEXT = SUPPORTED_EXTENSIONS.map(ext => ext.toUpperCase()).join(', ');

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf':
            return '/icons/pdf-icon.png';   // your pdf icon path
        case 'doc':
        case 'docx':
            return '/icons/word-icon.png';
        case 'jpg':
        case 'jpeg':
        case 'png':
            return null; // these can be displayed directly
        default:
            return '/icons/file-icon.png';  // generic file icon
    }
};

const Thumbnail: React.FC<ThumbnailProps> = ({ file, size, onClick, onRemove }) => {
    const isFile = file instanceof File;
    const url = isFile ? URL.createObjectURL(file) : file;
    const name = isFile ? file.name : file.split('/').pop() || '';
    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'relative',
                width: size,
                height: size,
                boxShadow: 1,
                m: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 4,
                },
                '&:hover .remove-icon': {
                    display: 'flex',
                },
            }}
        >
            <IconButton
                className="remove-icon"
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                }}
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    display: 'none',
                    bgcolor: 'rgba(255,255,255,0.7)',
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
            <Box sx={{ p: 0.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={getFileIcon(name) || url}
                        alt={name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                </Box>
                <Typography variant="caption" noWrap>{name}</Typography>
            </Box>
        </Box>
    );
};

const ThumbnailList: React.FC<ThumbnailListProps> = ({ attachments, thumbnailSize = 100, onRemove }) => {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const handleOpen = (i: number) => {
        setIndex(i);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const showPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((idx) => (idx - 1 + attachments.length) % attachments.length);
    };

    const showNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((idx) => (idx + 1) % attachments.length);
    };

    return (
        <>
            <Box display="flex" flexWrap="wrap">
                {attachments.map((file, i) => (
                    <Thumbnail
                        key={i}
                        file={file}
                        size={thumbnailSize}
                        onClick={() => handleOpen(i)}
                        onRemove={onRemove ? () => onRemove(i) : undefined}
                    />
                ))}
            </Box>
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        outline: 'none',
                    }}
                >
                    {attachments.length > 0 && (
                        <Box display="flex" alignItems="center">
                            <IconButton onClick={showPrev}>
                                <ArrowBackIosNewIcon />
                            </IconButton>
                            {(() => {
                                const current = attachments[index];
                                const isFile = current instanceof File;
                                const url = isFile ? URL.createObjectURL(current) : current;
                                const alt = isFile ? current.name : current.split('/').pop() || '';
                                return (
                                    <img
                                        src={url}
                                        alt={alt}
                                        style={{ maxHeight: '80vh', maxWidth: '80vw' }}
                                    />
                                );
                            })()}
                            <IconButton onClick={showNext}>
                                <ArrowForwardIosIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );
};

const FileUpload: React.FC<FileUploadProps> = ({ maxSizeMB, thumbnailSize, onFilesChange, attachments = [], hideUploadButton = false }) => {
    const [files, setFiles] = useState<File[]>(attachments);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setFiles(attachments);
        if (!attachments || attachments.length === 0) {
            setError('');
        }
    }, [attachments]);

    const handleRemove = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        onFilesChange?.(updated);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid: File[] = [];
        const errors: string[] = [];

        selected.forEach((file) => {
            const extension = getFileExtension(file.name);
            if (!SUPPORTED_EXTENSIONS.includes(extension)) {
                if (!errors.includes('File not supported')) {
                    errors.push('File not supported');
                }
                return;
            }

            if (bytesToMB(file.size) > maxSizeMB) {
                errors.push(`Max upload size exceeded. Limit is ${maxSizeMB} MB`);
                return;
            }

            valid.push(file);
        });

        if (valid.length > 0) {
            const updated = [...files, ...valid];
            setFiles(updated);
            onFilesChange?.(updated);
        }

        if (errors.length > 0) {
            setError(errors[0]);
        } else {
            setError('');
        }

        e.target.value = '';
    };

    return (
        <Box>
            {!hideUploadButton && (
                <div className='d-flex align-items-center'>
                    <Button variant="contained" component="label">
                        Choose File
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={onChange}
                            accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                        />
                    </Button>
                    <Typography className='text-muted mx-2' variant="body2">Max upload size: {maxSizeMB} MB</Typography>
                    <Typography className='text-muted mx-2' variant="body2">Supported file types: {SUPPORTED_EXTENSIONS_TEXT}</Typography>
                </div>
            )}
            {error && (<Typography color="error" variant="body2">{error}</Typography>)}
            <ThumbnailList attachments={files} thumbnailSize={thumbnailSize} onRemove={handleRemove} />
        </Box>
    );
};

export default FileUpload;
export { ThumbnailList };

