import React, { useState } from 'react';
import { Box, Button, Typography, Modal, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface FileUploadProps {
    maxSizeMB: number;
    thumbnailSize?: number;
    onFilesChange?: (files: File[]) => void;
}

interface ThumbnailListProps {
    attachments: File[];
    thumbnailSize?: number;
}

interface ThumbnailProps {
    file: File;
    size: number;
    onClick: () => void;
}

const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

const Thumbnail: React.FC<ThumbnailProps> = ({ file, size, onClick }) => {
    const url = URL.createObjectURL(file);
    return (
        <Box
            onClick={onClick}
            sx={{
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
            }}
        >
            <Box sx={{ p: 0.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={url}
                        alt={file.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                </Box>
                <Typography variant="caption" noWrap>{file.name}</Typography>
            </Box>
        </Box>
    );
};

const ThumbnailList: React.FC<ThumbnailListProps> = ({ attachments, thumbnailSize = 100 }) => {
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
                    <Thumbnail key={i} file={file} size={thumbnailSize} onClick={() => handleOpen(i)} />
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
                            <img
                                src={URL.createObjectURL(attachments[index])}
                                alt={attachments[index].name}
                                style={{ maxHeight: '80vh', maxWidth: '80vw' }}
                            />
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

const FileUpload: React.FC<FileUploadProps> = ({ maxSizeMB, thumbnailSize, onFilesChange }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid: File[] = [];
        selected.forEach((file) => {
            const diff = bytesToMB(file.size) - maxSizeMB;
            if (diff > 0) {
                setError(`Max upload size exceeded by ${diff.toFixed(2)} MB`);
            } else {
                valid.push(file);
            }
        });
        if (valid.length > 0) {
            setFiles((prev) => {
                const updated = [...prev, ...valid];
                onFilesChange?.(updated);
                return updated;
            });
            setError('');
        }
        e.target.value = '';
    };

    return (
        <Box>
            <Button variant="contained" component="label">
                Choose File
                <input type="file" hidden multiple onChange={onChange} />
            </Button>
            <Typography variant="body2">Max upload size: {maxSizeMB} MB</Typography>
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <ThumbnailList attachments={files} thumbnailSize={thumbnailSize} />
        </Box>
    );
};

export default FileUpload;
export { ThumbnailList };

