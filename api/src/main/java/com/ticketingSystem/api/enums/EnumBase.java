package com.ticketingSystem.api.enums;

public interface EnumBase<T> {
	public T Value();

	/**
	 * This method is used for display the user friendly name of enum.
	 * Using this method refer {@link TransactionType} enum.
	 * <br><b>#Usability<b></br>
	 * Create one static block and put the user friendly name in hashmap and get the value from map in this method.
	 * @return
	 */
	public String getDisplay();
}