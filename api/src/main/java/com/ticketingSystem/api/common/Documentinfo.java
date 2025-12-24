package com.ticketingSystem.api.common;
// Generated 3 Aug, 2015 5:16:33 PM by Hibernate Tools 4.3.1

import jakarta.persistence.*;

import java.io.File;

@Entity
@Table(name="documentinfo"
)
public class Documentinfo implements java.io.Serializable {


     private int id;
     private String version;
     private Repositorydefinition repositorydefinition;
     private String relativepath;
     private String filename;
     private String preAuthUploadUrl;
//     private UploadStatus uploadStatus;


	public Documentinfo() {
    }


    @Id 
	@Column(name="id", unique=true, nullable=false)
	@GeneratedValue(strategy = GenerationType.IDENTITY) 
    public int getId() {
        return this.id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    @Column(name="version")
    public String getVersion() {
        return this.version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }

    @ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="repositoryid")
    public Repositorydefinition getRepositorydefinition() {
        return this.repositorydefinition;
    }
    
    public void setRepositorydefinition(Repositorydefinition repositorydefinition) {
        this.repositorydefinition = repositorydefinition;
    }
    
    @Column(name="relativepath")
    public String getRelativepath() {
        return this.relativepath;
    }
    
    public void setRelativepath(String relativepath) {
        this.relativepath = relativepath;
    }

    
    @Column(name="filename")
    public String getFilename() {
        return this.filename;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
    
    @Column(name="preauthuploadurl")
    public String getPreAuthUploadUrl() {
        return this.preAuthUploadUrl;
    }
    
    public void setPreAuthUploadUrl(String preAuthUploadUrl) {
        this.preAuthUploadUrl = preAuthUploadUrl;
    }
    
//    @Column(name="uploadstatus")
//    @Enumerated(EnumType.ORDINAL)
//    public UploadStatus getUploadStatus() {
//        return this.uploadStatus;
//    }
//
//    public void setUploadStatus(UploadStatus uploadStatus) {
//        this.uploadStatus = uploadStatus;
//    }
    
    @Transient
    public String getFilePath() {
    	return repositorydefinition.getRepositoryroot() + File.separator + getRelativepath() + File.separator + getFilename();
    }
  
}


