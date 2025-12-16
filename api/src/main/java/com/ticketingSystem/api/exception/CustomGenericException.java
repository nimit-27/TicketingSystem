package com.ticketingSystem.api.exception;

import com.ticketingSystem.api.constants.ErrorCodes;

import java.text.MessageFormat;

public class CustomGenericException extends MarkForRollbackException {
	private static final long serialVersionUID = 1L;
	public static boolean flag = false;
	private int errCode = ErrorCodes.INTERNAL_ERROR;
	private String errFullMsg;
	private String errSpecificMsg;
	public String getUnformattedMsg() {
		return unformattedMsg;
	}

	public void setUnformattedMsg(String unformattedMsg) {
		this.unformattedMsg = unformattedMsg;
	}

	public Object[] getParamValues() {
		return paramValues;
	}

	public void setParamValues(Object[] paramValues) {
		this.paramValues = paramValues;
	}

	private String unformattedMsg;
	private Object[] paramValues;

	public String getErrSpecificMsg() {
		return errSpecificMsg;
	}

	public void setErrSpecificMsg(String errSpecificMsg) {
		this.errSpecificMsg = errSpecificMsg;
	}

	public int getErrCode() {
		return errCode;
	}

	public void setErrCode(int errCode) {
		this.errCode = errCode;
	}

	public String getErrMsg() {
		return unformattedMsg== null ? errFullMsg : MessageFormat.format(unformattedMsg, paramValues);
	}

	public void setErrMsg(String errMsg) {
		this.errFullMsg = errMsg;
	}
	/*
 	public CustomGenericException(int errCode, String errMsg, Exception e) {
 		this.errCode = errCode;
 		this.errMsg = errMsg;
 	}
 	 */
	
	/***
	 * Use CustomGenericException.CreateCustomGenericException method instead of this which is localization friendly 
	 * @param errMsg
	 */
	@Deprecated 
	public CustomGenericException(String errMsg) {
		this.errFullMsg = errMsg;
		this.errSpecificMsg=errMsg;
	}
	
	public CustomGenericException(Object params[], String unformattedMsg) {
		this.unformattedMsg = unformattedMsg;
		this.paramValues=params;
//		this.errFullMsg = DSMessageSource.getDSMessageSource().getLocalizedMessage(unformattedMsg, params);
		this.errSpecificMsg=this.errFullMsg;
	}

	public CustomGenericException(Exception e, String errMsg, Object... params) {
		this(ErrorCodes.INTERNAL_ERROR, e, errMsg, params);
	}
	

	private CustomGenericException(int errCode, String methodName, String message, Exception e) {
		this.errSpecificMsg = message;
		//this.errMsg = "Exception Method --> "+methodName +" \r\n Message --> "+message + "\r\n Exception Message --> "+e == null ? "" : e.getMessage() + "\r\n Stack Trace --> "+e == null ? "" : e.getStackTrace().toString();
		this.errCode = errCode;
//		if(e == null) {
//			this.errFullMsg = ("Exception Method --> "+methodName +" \r\n Message --> "+message + "\r\n <span class='hidden'> Exception Message --> "+ ExceptionUtils.getMessage(this) + "\r\n Stack Trace --> "+ ExceptionUtils.getStackTrace(this)+"</span>");
//		} else {
//			this.errFullMsg = ("Exception Method --> "+methodName +"\r\n Message --> "+message + "\r\n <span class='hidden'> Exception Message --> "+ ExceptionUtils.getMessage(e) + "\r\n Stack Trace --> "+ ExceptionUtils.getStackTrace(e)+"</span>");
//		}
	}	

	public CustomGenericException(int errCode, Exception e, String message, Object...newParam2) {
		this.unformattedMsg = String.format("Error: {0} _NEWLINE_ Error Code: {1} _NEWLINE_ Exception Occurred: {2}");
//		this.paramValues = new Object [] { DSMessageSource.getDSMessageSource().getLocalizedMessage(message, newParam2), errCode, (e == null ? "None" : e.getMessage()  ) }; 
	}

	public static CustomGenericException CreateUnformattedException(int errCode, Exception e, String msg,
			Object...newParam2) {
		return new CustomGenericException(errCode, e, msg, newParam2);
	}
	
	public static CustomGenericException CreateUnformattedException(Exception e, String msg,
			Object...newParam2) {
		return new CustomGenericException(ErrorCodes.INTERNAL_ERROR, e, msg, newParam2);
	}
	
	public static CustomGenericException CreateUnformattedException(Exception e, String msg,
			Object newParam2, Object newParam3) {
		return new CustomGenericException(ErrorCodes.INTERNAL_ERROR, e, msg, newParam2);
	}
		
	public static CustomGenericException CreateUnformattedException(String unformattedMsg, Object... params) {
		return new CustomGenericException(params, unformattedMsg);
	}

}