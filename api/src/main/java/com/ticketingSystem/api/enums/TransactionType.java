package com.ticketingSystem.api.enums;

import java.util.HashMap;


public enum TransactionType implements EnumBase<Integer>{

	/***
	 * Used for movement of commodity from BRL Stacks. Used with Generic class. 
	 */
	BRL_MOVEMENT(26), 
	
	
	/***
	 * Used with Generic Class for lifting of BRL Commodity by Miller.
	 */
	LIFTING_BRL_STOCKS(27),

	TICKETING_SYSTEM(1);

	private Integer value;

	TransactionType(int value) {
		this.value = value;
	}

	@Override
	public Integer Value() {
		return value;
	}

	public static TransactionType ToValue(Integer i) {
		return TransactionType.values()[i];
	}

	private static final HashMap<TransactionType, String> map = new HashMap<>();

	static {
		map.put(TransactionType.BRL_MOVEMENT, "BRL for Movement");
		map.put(TransactionType.LIFTING_BRL_STOCKS, "Lifting BRL Stocks by Miller");
		map.put(TransactionType.TICKETING_SYSTEM, "Ticketing System");
	}

	@Override
	public String getDisplay() {
		return map.get(this);
	}

	public static String getAllOptions(){
		StringBuilder options = new StringBuilder();
		for(TransactionType tt: TransactionType.values()) {
			options.append("<option value=\""+tt.Value()+"\">"+tt.getDisplay()+"</option>");
		}

		return options.toString();
	}
}