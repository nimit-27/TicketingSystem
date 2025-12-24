package com.ticketingSystem.api.enums;

import java.util.HashMap;


public enum RepositoryType implements EnumBase<Integer> {

	FILE(0), ALFRESCO(1), OCI_BUCKET(2);

	private Integer value;

	RepositoryType(int value) {
		this.value = value;
	}

	@Override
	public Integer Value() {
		return value;
	}

	public RepositoryType ToValue(Integer i) {
		return RepositoryType.values()[i];
	}

	private static final HashMap<RepositoryType, String> map = new HashMap<>();

	static {
		map.put(RepositoryType.FILE, "");
		map.put(RepositoryType.ALFRESCO, "");
		map.put(RepositoryType.OCI_BUCKET, "");
	}

	@Override
	public String getDisplay() {
		return map.get(this);
	}
}