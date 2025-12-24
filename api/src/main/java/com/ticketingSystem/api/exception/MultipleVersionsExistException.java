package com.ticketingSystem.api.exception;

public class MultipleVersionsExistException extends Exception {
	private static final long serialVersionUID = 1L;
	private int errCode;
	private String errMsg;
	private Object[] params;

	public int getErrCode() {
		return errCode;
	}

	public void setErrCode(int errCode) {
		this.errCode = errCode;
	}

	public String getErrMsg() {
		return errMsg;
	}

	public void setErrMsg(String errMsg) {
		this.errMsg = errMsg;
	}

	private MultipleVersionsExistException(int errCode, String errMsg) {
		this.errCode = errCode;
		this.errMsg = errMsg;
	}
	
	public MultipleVersionsExistException(String errMsg, Object...params) {
		this.errMsg = errMsg;
		this.params = params;
	}
}
