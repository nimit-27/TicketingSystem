//package com.ticketingSystem.api.service.impl;
//
////\import com.fci.ad.constants.ErrorCodes;
////import com.fci.ad.enums.Documenttype;
////import com.fci.ad.opsengine.common.Documentinfo;
////import com.fci.ad.opsengine.common.Repositorydefinition;
////import com.fci.ad.opsengine.dto.PreauthenticatedRequestAccessType;
//import com.ticketingSystem.api.common.Documentinfo;
//import com.ticketingSystem.api.common.Repositorydefinition;
//import com.ticketingSystem.api.constants.ErrorCodes;
//import com.ticketingSystem.api.dto.PreauthenticatedRequestAccessType;
//import com.ticketingSystem.api.enums.Documenttype;
//import com.ticketingSystem.api.exception.CustomGenericException;
//import com.ticketingSystem.api.exception.MarkForRollbackException;
//import com.ticketingSystem.api.exception.MultipleVersionsExistException;
//import com.ticketingSystem.api.service.OciUploadService;
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.jvnet.hk2.annotations.Service;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.io.ByteArrayOutputStream;
//import java.util.Date;
//import java.util.List;
//
///**
// * OCI Object Storage implementation of RepositoryService
// * Extends RepositoryServiceImpl and overrides only file operations and adds pre-auth URL methods
// * Handles document storage in OCI bucket with pre-authenticated URL generation
// *
// * @author OCI Implementation
// */
////@Transactional(rollbackFor={RuntimeException.class, Error.class, MarkForRollbackException.class})
//@Service
//public class OCIRepositoryServiceImpl {
//
//    static Logger logger = LogManager.getLogger(OCIRepositoryServiceImpl.class);
//
//    @Autowired
//    com.ticketingSystem.api.service.OciUploadService ociUploadService;
//
//    // OCI Configuration Properties
//    @Value("${oci.namespace}")
//    private String namespace;
//
//    @Value("${oci.bucket}")
//    private String bucket;
//
//    @Value("${oci.region}")
//    private String region;
//
//    @Value("${oci.preAuthUrlExpiryMinutes:60}")
//    private int preAuthUrlExpiryMinutes;
//
//    // Override saveFileToRepository to upload to OCI instead of filesystem
////    @Override
////    protected Documentinfo saveFileToRepository(Repositorydefinition repo, java.io.InputStream fileStream, String fileName, String filePath, int version, boolean allowedMultipleVersion, boolean overwrite, Documenttype docType, Object object) throws MultipleVersionsExistException, CustomGenericException {
////        logger.info("OCI Repository: saveFileToRepository - fileName: {}, filePath: {}, version: {}", fileName, filePath, version);
////
////        try {
////            // Just call createDocument (same as parent) - the actual upload will be handled there
////            Documentinfo docInfo = createDocument(fileStream, fileName, filePath, null, version, allowedMultipleVersion, overwrite, docType, object);
////
////            if(docInfo != null) {
////                // Set repository definition for compatibility
////                docInfo.setRepositorydefinition(repo);
////            }
////
////            return docInfo;
////
////        } catch (Exception e) {
////            logger.error("OCI Repository: Failed to save file to repository - fileName: {}, filePath: {}", fileName, filePath, e);
////            throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Failed to save file to OCI repository: {1}", e.getMessage());
////        }
////    }
//
//    // Override createDocument to handle OCI upload instead of filesystem operations
////    @Override
////    protected Documentinfo createDocument(java.io.InputStream inputStream, String fileName, String filePath, String newFileName, Integer version, boolean allowedMultipleVersion, boolean overwrite, Documenttype docType, Object object) throws com.fci.ad.common.exception.MultipleVersionsExistException, CustomGenericException {
////        logger.info("OCI Repository: Creating document - fileName: {}, filePath: {}, version: {}", fileName, filePath, version);
////
////        String fileNameToSave = fileName;
////
////        try {
////            // Handle versioning logic (same as parent)
////            if(allowedMultipleVersion) {
//////                String fileExtension = com.fci.ad.opsengine.utils.FileUtils.getFileExtension(fileName);
////                if (fileName.contains("_ver_")) {
////                    String [] splitarray = fileName.split("_");
////                    fileName = fileName.replace(splitarray[splitarray.length-1], version+"");
////                } else {
//////                    fileName = com.fci.ad.opsengine.utils.FileUtils.getFileName(fileName) + "_ver_" + version;
////                }
//////                fileName = fileName + "." + fileExtension;
////                fileNameToSave = fileName;
////            }
////
////            // Handle overwrite logic (same as parent)
////            if(overwrite && newFileName != null) {
////                fileNameToSave = newFileName;
////            }
////
////            // Build the OCI object name
////            String objectName = buildObjectName(filePath, fileNameToSave);
////            logger.info("OCI Repository: Built object name for file upload: {}", objectName);
////
////            // Convert InputStream to byte array for OCI upload
////            if (inputStream != null || object != null) {
////	            ByteArrayOutputStream baos = new ByteArrayOutputStream();
////	            byte[] buffer = new byte[1024];
////	            int length;
////	            while ((length = inputStream.read(buffer)) != -1) {
////	                baos.write(buffer, 0, length);
////	            }
////	            byte[] fileBytes = baos.toByteArray();
////
////
////	            // Handle object serialization if needed (same as parent)
////	            if(object != null) {
////	                // For objects, we need to serialize them to bytes
////	                ByteArrayOutputStream objBaos = new ByteArrayOutputStream();
////	                java.io.ObjectOutputStream objStream = new java.io.ObjectOutputStream(objBaos);
////	                objStream.writeObject(object);
////	                objStream.close();
////	                fileBytes = objBaos.toByteArray();
////	            }
////
////
////	            // Actually upload the file to OCI
////	            logger.info("OCI Repository: Uploading file to OCI - objectName: {}", objectName);
////	            ociUploadService.uploadFile(objectName, fileBytes);
////	            logger.info("OCI Repository: Successfully uploaded file to OCI - objectName: {}", objectName);
////            }
////
////            // Create and return Documentinfo (same as parent)
////            String repositorySpecificVersion = version.toString();
////            Documentinfo docInfo = new Documentinfo();
////            docInfo.setFilename(fileNameToSave);
////            docInfo.setRelativepath(filePath);
////            docInfo.setVersion(repositorySpecificVersion);
////
////            logger.info("OCI Repository: Created document metadata - fileName: {}, filePath: {}, version: {}", fileNameToSave, filePath, version);
////
////            return docInfo;
////        } catch (Exception e) {
////            logger.error("Exception in Create OCI Document Method :: Message -->" + e.getMessage()+"\r\n Stack trace -->"+e.getStackTrace());
////            CustomGenericException.flag = true;
////            throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Exception in Create OCI Document Method");
////        }
////    }
//
//    // Override filesystem-specific methods that don't apply to OCI Object Storage
////    @Override
////    public List<String> getAllFilesInsideDirectory(String dirPath) {
////        logger.warn("OCI Repository: getAllFilesInsideDirectory called with dirPath: {} - This operation is not supported for OCI Object Storage", dirPath);
////        throw new UnsupportedOperationException("Directory listing operations are not supported for OCI Object Storage. Use OCI Console or OCI CLI for directory operations.");
////    }
//
////    @Override
////    public List<String> getAllDirInsideDirectory(String dirPath) {
////        logger.warn("OCI Repository: getAllDirInsideDirectory called with dirPath: {} - This operation is not supported for OCI Object Storage", dirPath);
////        throw new UnsupportedOperationException("Directory listing operations are not supported for OCI Object Storage. Use OCI Console or OCI CLI for directory operations.");
////    }
//
////    @Override
////    public void archiveDocuments(Integer documentmetadata, String repoPath, String archivePath) {
////        logger.warn("OCI Repository: archiveDocuments called - This operation is not supported for OCI Object Storage. documentmetadata: {}, repoPath: {}, archivePath: {}", documentmetadata, repoPath, archivePath);
////        throw new UnsupportedOperationException("Archive operations are not supported for OCI Object Storage. Use OCI Object Lifecycle Management or manual operations for archiving.");
////    }
//
////    @Override
////    public String getCompleteDocumentPath(int documentId, boolean getLatest) throws com.fci.ad.common.exception.MultipleVersionsExistException, CustomGenericException {
////        logger.warn("OCI Repository: getCompleteDocumentPath called for documentId: {} - This operation returns OCI object path, not filesystem path", documentId);
////
////        // For OCI, return the OCI object path instead of filesystem path
////        Documentinfo docInfo = getDocumentInfo(documentId);
////        if (docInfo != null) {
////            String objectName = buildObjectName(docInfo.getRelativepath(), docInfo.getFilename());
////            logger.info("OCI Repository: Returning OCI object path: {}", objectName);
////            return objectName;
////        }
////
////        throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, null, "Document not found for ID: {1}", documentId);
////    }
//
//    // OCI-specific methods for pre-authenticated URL generation
////    @Override
////    public String generateUploadUrl(String relativePath, String fileName) throws CustomGenericException {
////        try {
////            logger.info("OCI Repository: Generating upload URL - relativePath: {}, fileName: {}", relativePath, fileName);
////
////            String objectName = buildObjectName(relativePath, fileName);
////            logger.info("OCI Repository: Built object name for upload: {}", objectName);
////
////            String accessType = PreauthenticatedRequestAccessType.OBJECT_WRITE;
////            String name = "upload_" + System.currentTimeMillis();
////            String timeExpires = getExpirationTime();
////
////            String preAuthUrl = ociUploadService.createPreauthenticatedRequest(objectName, accessType, name, timeExpires);
////            logger.info("OCI Repository: Generated upload URL successfully for object: {}", objectName);
////
////            return preAuthUrl;
////        } catch (Exception e) {
////            logger.error("OCI Repository: Failed to generate upload URL - relativePath: {}, fileName: {}", relativePath, fileName, e);
////            throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Failed to generate OCI upload URL");
////        }
////    }
////
////    @Override
//    public String generateDownloadUrl(String relativePath, String fileName) throws CustomGenericException {
//        try {
//            logger.info("OCI Repository: Generating download URL - relativePath: {}, fileName: {}", relativePath, fileName);
//
//            String objectName = buildObjectName(relativePath, fileName);
//            logger.info("OCI Repository: Built object name for download: {}", objectName);
//
//            String accessType = PreauthenticatedRequestAccessType.OBJECT_READ;
//            String name = "download_" + System.currentTimeMillis();
//            String timeExpires = getExpirationTime();
//
//            String preAuthUrl = ociUploadService.createPreauthenticatedRequest(objectName, accessType, name, timeExpires);
//            logger.info("OCI Repository: Generated download URL successfully for object: {}", objectName);
//
//            return preAuthUrl;
//        } catch (Exception e) {
//            logger.error("OCI Repository: Failed to generate download URL - relativePath: {}, fileName: {}", relativePath, fileName, e);
//            throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Failed to generate OCI download URL");
//        }
//    }
//
//    // Private helper methods
//    private String buildObjectName(String relativePath, String fileName) {
//        // Convert filesystem path to OCI object name
//        // Replace Windows path separators with forward slashes
//        String objectName = relativePath.replace("\\", "/") + "/" + fileName;
//
//        // Remove any leading/trailing slashes
//        objectName = objectName.replaceAll("^/+|/+$", "");
//
//        // Additional cleanup for OCI Object Storage
//        // Remove any double slashes and ensure proper formatting
//        objectName = objectName.replaceAll("/+", "/");
//
//        // Ensure the object name doesn't start with a slash
//        if (objectName.startsWith("/")) {
//            objectName = objectName.substring(1);
//        }
//
//        // Remove trailing slash from the final object name
//        if (objectName.endsWith("/")) {
//            objectName = objectName.substring(0, objectName.length() - 1);
//        }
//
//        logger.debug("OCI Repository: Built object name - relativePath: {}, fileName: {}, objectName: {}", relativePath, fileName, objectName);
//        return objectName;
//    }
//
//    private String getExpirationTime() {
//        // Calculate expiration time based on configuration
//        long currentTime = System.currentTimeMillis();
//        long expirationTime = currentTime + (preAuthUrlExpiryMinutes * 60 * 1000L);
//        return new Date(expirationTime).toInstant().toString();
//    }
//
////	@Override
////	public void updateDocumentInfo(Documentinfo documentInfo) throws CustomGenericException {
////		repositoryDAO.saveDocumnetInfo(documentInfo);
////	}
//}
