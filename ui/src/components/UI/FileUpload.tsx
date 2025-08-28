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
    attachments: (File | string)[];
    thumbnailSize?: number;
}

interface ThumbnailProps {
    file: File | string;
    size: number;
    onClick: () => void;
}

const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

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

const Thumbnail: React.FC<ThumbnailProps> = ({ file, size, onClick }) => {
    const isFile = file instanceof File;
    const url = isFile ? URL.createObjectURL(file) : file;
    const name = isFile ? file.name : file.split('/').pop() || '';
    {console.log({url, name, isFile})}
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
                    {/* <img
                        src={"/icons/pdf-icon.png"}
                        alt={name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    /> */}
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
            <Box className="border" display="flex" flexWrap="wrap">
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

