//package com.ticketingSystem.api.service.impl;
//
////import com.fci.ad.common.exception.CustomGenericException;
////import com.fci.ad.common.exception.MarkForRollbackException;
////import com.fci.ad.common.exception.MultipleVersionsExistException;
////import com.fci.ad.constants.ErrorCodes;
////import com.fci.ad.enums.Documenttype;
////import com.fci.ad.opsengine.common.Documentinfo;
////import com.fci.ad.opsengine.common.Documentmetadata;
////import com.fci.ad.opsengine.common.Repositorydefinition;
////import com.fci.ad.opsengine.dao.DocumentServiceDAO;
////import com.fci.ad.opsengine.dao.RepositoryDAO;
////import com.fci.ad.opsengine.service.RepositoryService;
////import com.fci.ad.opsengine.utils.FileUtils;
//import com.ticketingSystem.api.common.Documentinfo;
//import org.apache.commons.io.IOUtils;
////import org.apache.commons.lang3.SystemUtils;
////import org.apache.commons.lang3.exception.ExceptionUtils;
//import org.apache.logging.log4j.Level;
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.transaction.annotation.Propagation;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.io.*;
//import java.util.ArrayList;
//import java.util.Date;
//import java.util.List;
//
//@Transactional(rollbackFor={RuntimeException.class, Error.class, MarkForRollbackException.class})
//public abstract class RepositoryServiceImpl implements RepositoryService {
//
//	static Logger logger = LogManager.getLogger(RepositoryServiceImpl.class) /*AVOID duplicate sar */;
////@Autowired com.fci.ad.opsengine.service.ProcurementService procurementService;
////@Autowired com.fci.ad.opsengine.service.RoService roService;
////@Autowired com.fci.ad.opsengine.service.LabourService labourService;
////@Autowired com.fci.ad.opsengine.service.AssetService assetService;
//
//	@Autowired
//	RepositoryDAO repositoryDAO;
//
//	@Autowired
//	DocumentServiceDAO documentServiceDAO;
//
//
//
//	Repositorydefinition repository = null;
//
//	public String getRepositoryRoot() {
//		repository = repositoryDAO.getRepository();
//		return repository.getRepositoryroot();
//	}
//
//	@Override
//	public Documentinfo saveDocument(String fileName, String filePath, int version, InputStream fileStream, Documenttype docType) throws MultipleVersionsExistException, CustomGenericException {
//
//		repository = repositoryDAO.getRepository();
//
//		Documentinfo docInfo = saveFileToRepository(repository, fileStream, fileName, filePath, version, false, false, docType, null);
//
//		repositoryDAO.saveDocumnetInfo(docInfo);
//
//		return docInfo;
//	}
//
//	@Override
//	public Documentinfo saveObject(String fileName, String filePath, int version, Object object, Documenttype docType) throws MultipleVersionsExistException, CustomGenericException {
//
//		repository = repositoryDAO.getRepository();
//
//		Documentinfo docInfo = saveFileToRepository(repository, null, fileName, filePath, version, false, false, docType, object);
//
//		repositoryDAO.saveDocumnetInfo(docInfo);
//
//		return docInfo;
//	}
//
//	@Override
//	public void overwriteDocument(String fileName, String filePath, String newFileName, int version, InputStream fileStream, Documenttype docType) throws MultipleVersionsExistException, CustomGenericException {
//
//		createDocument(fileStream, fileName, filePath, newFileName, version, false, true, docType, null);
//
//	}
//
//	@Override
//	public void overwriteObject(String fileName, String filePath, int version, Object object, Documenttype docType) throws MultipleVersionsExistException, CustomGenericException {
//
//		createDocument(null, fileName, filePath, null, version, false, true, docType, object);
//
//	}
//
//	@Override
//	public Documentinfo saveNewVersionDocument(String fileName, String filePath, int version, InputStream fileStream, Documenttype docType) throws MultipleVersionsExistException, CustomGenericException {
//
//		repository = repositoryDAO.getRepository();
//
//		Documentinfo docInfo = saveFileToRepository(repository, fileStream, fileName, filePath, version, true, false, docType, null);
//
//		repositoryDAO.saveDocumnetInfo(docInfo);
//
//		return docInfo;
//	}
//
//	@Override
//	public Documentinfo saveNewVersionObject(String fileName, String filePath, int version, Object object, Documenttype docType) throws MultipleVersionsExistException, CustomGenericException {
//
//		repository = repositoryDAO.getRepository();
//
//		Documentinfo docInfo = saveFileToRepository(repository, null, fileName, filePath, version, true, false, docType, object);
//
//		repositoryDAO.saveDocumnetInfo(docInfo);
//
//		return docInfo;
//	}
//
//	protected Documentinfo saveFileToRepository(Repositorydefinition repo,InputStream fileStream, String fileName, String filePath, int version, boolean allowedMultipleVersion, boolean overwrite, Documenttype docType, Object object) throws MultipleVersionsExistException, CustomGenericException
//	{
//		// Appending the repo root path
//		if(repo.getRepositoryroot() != ""){
//			if(SystemUtils.IS_OS_LINUX){
//				filePath = repo.getRepositoryroot() + File.separator + filePath;
//
//				isReadable(new File(repo.getRepositoryroot()));
//			}else{
//				String str = repo.getRepositoryroot();
//				str = str.replace("/media", "\\\\fileserver");
//				filePath = str + File.separator + filePath;
//			}
//		}
//
//		Documentinfo docInfo = createDocument(fileStream, fileName, filePath, null, version,  allowedMultipleVersion, overwrite, docType, object);
//		if(docInfo != null) {
//			docInfo.setRepositorydefinition(repo);
//		}
//		return docInfo;
//	}
//
//	protected Documentinfo createDocument(InputStream inputStream, String fileName, String filePath, String newFileName, Integer version, boolean allowedMultipleVersion, boolean overwrite, Documenttype docType, Object object)
//			throws MultipleVersionsExistException, CustomGenericException {
//		OutputStream outputStream = null;
//		Documentinfo docInfo = null;
//		ObjectOutputStream objStream = null;
//		String fileNameToSave = fileName;
//		try {
//			File dir = new File(filePath);
//
//			if (!dir.exists()) {
//				dir.mkdirs();
//			}
//
//			File file = new File(filePath + File.separator + fileName);
//
//			// Temporary work around for fixing file not found for all doc
//			if(overwrite && !file.exists()){
//				overwrite = false;
//				allowedMultipleVersion = false;
//				logger.log(Level.WARN, "File not found but handling manually!");
//			}
//
//			if(overwrite && !file.exists()) {
//				throw new FileNotFoundException();
//			}
//
//			if(file.exists())
//			{
//				// Temporary work around for fixing multiple version exists for all doc
//				if(!overwrite && !allowedMultipleVersion){
//					overwrite = true;
//					logger.log(Level.WARN, "Multiple Files found but handling manually!");
//				}
//
//				if(overwrite)
//				{
//					//SmbFileOutputStream sfos = new SmbFileOutputStream(file);
//					outputStream = new FileOutputStream(file, false);
//
//					File newFile = new File(filePath + newFileName);
//					file.renameTo(newFile);
//					fileNameToSave = newFileName;
//				}
//				else if(allowedMultipleVersion)
//				{
//					String fileExtension = FileUtils.getFileExtension(fileName);
//					if (fileName.contains("_ver_")) {
//						String [] splitarray = fileName.split("_");
//						fileName = fileName.replace(splitarray[splitarray.length-1], version+"");
//					}else{
//						fileName = FileUtils.getFileName(fileName) + "_ver_" + version;
//					}
//
//					//If still there is conflict
//					if(new File(filePath + File.separator + fileName + "." + fileExtension).exists())
//					{
//						logger.log(Level.WARN, "Conflict for file name '"+fileName+fileExtension+"' and file path is '"+filePath+"'");
//						fileName += GetConflictSuffix(dir);
//						fileName = fileName + fileExtension;
//					}
//
//					fileName = fileName + "." +fileExtension;
//					fileNameToSave = fileName;
//
//					outputStream = new FileOutputStream(new File(filePath + File.separator + fileName));
//				}else
//				{
//					throw new MultipleVersionsExistException("File Already Exists.");
//				}
//			}else{
//				outputStream = new FileOutputStream(file);
//			}
//
//			if(object != null){
//				objStream = new ObjectOutputStream(outputStream);
//				objStream.writeObject(object);
//			}else{
//				//Writes to the output stream
//				IOUtils.copy(inputStream, outputStream);
//			}
//
//			//System.out.println("Done!");
//
//			String repositorySpecificVersion =  version.toString();
//			docInfo = new Documentinfo();
//			docInfo.setFilename(fileNameToSave);
//			docInfo.setRelativepath(filePath);
//			docInfo.setVersion(repositorySpecificVersion);
//
//		} catch (IOException e) {
//			logger.error("Exception in Create Document Method in Repository Service :: Message -->" + e.getMessage()+"\r\n Stack trace -->"+e.getStackTrace());
//			logger.error(ExceptionUtils.getStackTrace(e));
//			CustomGenericException.flag = true;
//			throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Exception in Create Document Method");
//		}  finally {
//			if (inputStream != null) {
//				try {
//					inputStream.close();
//				} catch (IOException e) {
//					logger.error("Exception in Closing the Input Stream in Repository Service :: Message -->" + e.getMessage()+"\r\n Stack trace -->"+e.getStackTrace());
//					logger.error(ExceptionUtils.getStackTrace(e));
//					throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Exception in Closing the Input Stream");
//				}
//			}
//			if (outputStream != null) {
//				try {
//					outputStream.close();
//				} catch (IOException e) {
//					logger.error("Exception in Closing the Output Stream in Repository Service :: Message -->" + e.getMessage()+"\r\n Stack trace -->"+e.getStackTrace());
//					logger.error(ExceptionUtils.getStackTrace(e));
//					throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Exception in Closing the Output Stream");
//				}
//			}
//			if (objStream != null) {
//				try {
//					objStream.close();
//				} catch (IOException e) {
//					logger.error("Exception in Closing the Object Output Stream in Repository Service :: Message -->" + e.getMessage()+"\r\n Stack trace -->"+e.getStackTrace());
//					logger.error(ExceptionUtils.getStackTrace(e));
//					throw CustomGenericException.CreateUnformattedException(ErrorCodes.CREATE_DOCUMENT, e, "Exception in Closing the Object Output Stream");
//				}
//			}
//		}
//		return docInfo;
//	}
//
//	private boolean isReadable(File file) throws CustomGenericException{
//		boolean retval = true;
//		try {
//			retval = file.exists();
//			if(!retval) {
//				throwNotReadable();
//			}
//			retval = file.isDirectory();
//			if(!retval) {
//				throwNotReadable();
//			}
//			retval = file.canRead();
//			if(!retval) {
//				throwNotReadable();
//			}
//		} catch (Exception e) {
//			logger.error("Exception in connecting to repository :: Message -->" + e.getMessage()+"\r\n Stack trace -->"+e.getStackTrace());
//			logger.error(ExceptionUtils.getStackTrace(e));
//			CustomGenericException.flag = true;
//			throw CustomGenericException.CreateUnformattedException(ErrorCodes.CONNECTION_TO_REPOSITORY, e, "Exception in connecting to repository, please try after some time.");
//		}finally{
//		}
//
//		if(!retval){
//			logger.error("Exception in connecting to repository");
//			CustomGenericException.flag = true;
//			throw CustomGenericException.CreateUnformattedException(ErrorCodes.CONNECTION_TO_REPOSITORY, null, "Exception in connecting to repository, please try after some time.");
//		}
//
//		return true;
//	}
//
//	private void throwNotReadable() throws CustomGenericException{
//		logger.error("Exception in connecting to repository");
//		CustomGenericException.flag = true;
//		throw CustomGenericException.CreateUnformattedException(ErrorCodes.CONNECTION_TO_REPOSITORY, null, "Exception in connecting to repository, please try after some time.");
//	}
//	private String GetConflictSuffix(File dir) {
//		int count = dir.list().length;
//		return "_" + (count + 1);
//	}
//
//	@Override
//	public Documentinfo getDocumentInfo(int documentId) {
//		return repositoryDAO.getDocumentInfo(documentId);
//	}
//
//	@Override
//	public String getCompleteDocumentPath(int documentId, boolean getLatest)
//			throws MultipleVersionsExistException, CustomGenericException {
//		Documentinfo docInfo = repositoryDAO.getCompleteDocumentPath(documentId, getLatest);
//		String filePath = docInfo.getRelativepath();
//		String fileName = docInfo.getFilename();
//		return filePath+File.separator+fileName;
//	}
//
//	@Override
//	public List<String> getAllFilesInsideDirectory(String dirPath){
//		File folder = new File(dirPath);
//		File[] listOfFiles = folder.listFiles();
//		List<String> files =new ArrayList<String>();
//		if(listOfFiles != null) {
//			for (File listOfFile : listOfFiles) {
//				if (listOfFile.isFile()) {
//					////System.out.println("File " + listOfFiles[i].getName());
//					files.add(listOfFile.getName());
//				} else if (listOfFile.isDirectory()) {
//					// System.out.println("Directory " + listOfFiles[i].getName());
//					// files.add("Directory " + listOfFiles[i].getName());
//				}
//			}
//		}
//		return files;
//	}
//
//	@Override
//	public List<String> getAllDirInsideDirectory(String dirPath){
//		File folder = new File(dirPath);
//		File[] listOfFiles = folder.listFiles();
//		List<String> files = new ArrayList<String>();
//		if(listOfFiles != null) {
//			for (File listOfFile : listOfFiles) {
//				if (listOfFile.isFile()) {
//					////System.out.println("File " + listOfFiles[i].getName());
//					//files.add("File " + listOfFiles[i].getName());
//				} else if (listOfFile.isDirectory()) {
//					////System.out.println("Directory " + listOfFiles[i].getName());
//					files.add(listOfFile.getName());
//				}
//			}
//		}
//		return files;
//	}
//
//	@Override
//	@Transactional(propagation=Propagation.REQUIRES_NEW, rollbackFor=Exception.class)
//	public void archiveDocuments(Integer documentmetid, String repoPath, String archivePath){
//		Documentmetadata documentmetadata = documentServiceDAO.getDocumentMetatdata(documentmetid);
//		Documentinfo documentinfo = documentmetadata.getDocument();
//		String srcPath = documentinfo.getRelativepath();
//		String destPath = srcPath.replace("\\", "/").replaceAll(repoPath, "");
//		destPath = archivePath + destPath;
//		ArchiveResult archiveResult = moveFile(srcPath, destPath, documentinfo.getFilename(), documentinfo);
//		if(archiveResult.isFileMoved){
//			documentinfo.setRelativepath(destPath);
//			repositoryDAO.saveDocumnetInfo(documentinfo);
//
//			documentmetadata.setIsarchived(true);
//			documentmetadata.setIsdeleted(false);
//			documentServiceDAO.saveDocumentMetadata(documentmetadata);
//
//			if(!archiveResult.isSrcDeleted){
//				try{
//					File srcFile = new File(srcPath + File.separator + documentinfo.getFilename());
//					if(srcFile.exists())
//						srcFile.delete();
//				}catch(Exception e){
//					logger.error(ExceptionUtils.getStackTrace(e));
//				}
//			}
//		}else if(!archiveResult.isSrcExists){
//			documentmetadata.setIsdeleted(true);
//			documentServiceDAO.saveDocumentMetadata(documentmetadata);
//		}
//	}
//
//	private ArchiveResult moveFile(String source, String destination, String filename, Documentinfo documentinfo){
//		InputStream srcIP = null;
//		OutputStream desIP = null;
//
//		File srcFile = new File(source + File.separator + filename);
//		if(!srcFile.exists()){
//			return new ArchiveResult(false, false, false);
//		}
//
//		try{
//			srcIP = new FileInputStream(source + File.separator + filename);
//
//			File destDir = new File(destination);
//			if(!destDir.exists())
//				destDir.mkdirs();
//
//			desIP = new FileOutputStream(destination + File.separator + filename);
//			IOUtils.copy(srcIP, desIP);
//
//			try{
//				srcFile.delete();
//			}catch(Exception e){
//				logger.error(ExceptionUtils.getStackTrace(e));
//				return new ArchiveResult(true, true, false);
//			}
//			return new ArchiveResult(true, true, true);
//		} catch (IOException e) {
//			logger.error(ExceptionUtils.getStackTrace(e));
//			return new ArchiveResult(true, false, false);
//		}finally{
//			try {
//				if(srcIP != null){
//					srcIP.close();
//				}
//			} catch (IOException e) {
//				logger.error(ExceptionUtils.getStackTrace(e));
//			}
//			try {
//				if(desIP != null){
//					desIP.close();
//				}
//			} catch (IOException e) {
//				logger.error(ExceptionUtils.getStackTrace(e));
//			}
//		}
//	}
//
//	private static class ArchiveResult{
//		private boolean isFileMoved;
//		private boolean isSrcExists;
//		private boolean isSrcDeleted;
//		private ArchiveResult(Boolean isSrcExist, Boolean isFileMoved, Boolean isSrcDeleted){
//			this.isFileMoved = isFileMoved;
//			this.isSrcExists = isSrcExist;
//			this.isSrcDeleted = isSrcDeleted;
//		}
//	}
//
//	@Override
//	public Repositorydefinition getRepository() {
//		return repositoryDAO.getRepository();
//	}
//
//	@Override
//	public List<Integer> getDocumentForArchive(Date archiveDate) {
//		return repositoryDAO.getDocumentForArchive(archiveDate);
//	}
//
//}
