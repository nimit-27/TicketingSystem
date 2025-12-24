package com.ticketingSystem.api.enums;

import java.util.HashMap;


public enum Documenttype implements EnumBase<Integer> {
	DSR(0), DSI(1), ACCEPTANCENOTE(2), WEIGHTCHECKMEMO(3), REJECTIONNOTE(4), INSPECTIONREPORT(5), JOINTINSPECTIONREPORT(6),PRIORITYLISTGENERATION(7), DEPOTLAYOUTIMAGE(8), RODATEEXTENSION(9),
	DEPOTCONFIGURATION(10), DEPOTDYNAMICCONFIGURATION(11), P_DEPOTCONFIGURATION(12), P_DEPOTDYNAMICCONFIGURATION(13), MOBILE_APK(14),MISCELLANEOUS(15), DEPOTDISTRICTDATA_MILLER(16), DEPOTREGIONDATA(17), DEPOTDISTRICTDATA_MANDI(18),
	UPLOAD_ISIPVSTACKS(19), MANDI_PINCODE_ASSOCIATION(20), COMPLETEDPV(21), ISI_PV_SAMPLE(22), VENDOR_DOC_ATTACHED(23), REPORT_PACKAGE(24), SERVICE_TASK_PACKAGE(25), MISCELLANEOUS_DATED(26), PV_CREATION(27), PROFILE_PICTURE(28);

	private Integer value;

	Documenttype(int value) {
		this.value = value;
	}

	@Override
	public Integer Value() {
		return value;
	}

	private static final HashMap<Documenttype, String> map = new HashMap<>();

	static {
		map.put(Documenttype.DSR, "");
		map.put(Documenttype.DSI, "");
		map.put(Documenttype.ACCEPTANCENOTE, "Acceptance Note");
		map.put(Documenttype.WEIGHTCHECKMEMO, "Weight Check Memo");
		map.put(Documenttype.REJECTIONNOTE, "");
		map.put(Documenttype.INSPECTIONREPORT, "");
		map.put(Documenttype.DEPOTLAYOUTIMAGE, "");
		map.put(Documenttype.RODATEEXTENSION, "");
		map.put(Documenttype.UPLOAD_ISIPVSTACKS, "Upload ISI PV stacks");
		map.put(Documenttype.COMPLETEDPV, "Completed PV");
		map.put(Documenttype.ISI_PV_SAMPLE, "ISI PV Template");
		map.put(Documenttype.VENDOR_DOC_ATTACHED, "Vendor Document");
		map.put(Documenttype.REPORT_PACKAGE, "Report Package");
		map.put(Documenttype.SERVICE_TASK_PACKAGE, "Service Task Package");
	}

	@Override
	public String getDisplay() {
		return map.get(this);
	}

	public Documenttype ToValue(Integer i) {
		return Documenttype.values()[i];
	}

//	public OrgScope getScope(Documenttype dt)
//	{
//		switch(dt) {
//		case DSR:
//		case DSI:
//		case ACCEPTANCENOTE:
//		case WEIGHTCHECKMEMO:
//		case REJECTIONNOTE:
//		case INSPECTIONREPORT:
//		case JOINTINSPECTIONREPORT:
//		case PRIORITYLISTGENERATION:
//		case DEPOTLAYOUTIMAGE:
//		case DEPOTCONFIGURATION:
//		case DEPOTDYNAMICCONFIGURATION:
//		case P_DEPOTCONFIGURATION:
//		case P_DEPOTDYNAMICCONFIGURATION:
//		case DEPOTDISTRICTDATA_MILLER:
//		case DEPOTDISTRICTDATA_MANDI:
//		case DEPOTREGIONDATA:
//		case COMPLETEDPV:
//			return OrgScope.DEPOT;
//		case RODATEEXTENSION:
//			return OrgScope.DISTRICT;
//		case VENDOR_DOC_ATTACHED:
//			return OrgScope.REGION;
//		default:
//			return OrgScope.GLOBAL;
//		}
//	}
//
//	//Entities that are tied to genericId
	public boolean isTransactionRelated(Documenttype dt)
	{
		switch(dt) {
		case DSR:
		case DSI:
		case PRIORITYLISTGENERATION:
		case DEPOTLAYOUTIMAGE:
		case RODATEEXTENSION:
		case DEPOTCONFIGURATION:
		case DEPOTDYNAMICCONFIGURATION:
		case P_DEPOTCONFIGURATION:
		case P_DEPOTDYNAMICCONFIGURATION:
		case MISCELLANEOUS:
			return false;

		case ACCEPTANCENOTE:
		case WEIGHTCHECKMEMO:
		case REJECTIONNOTE:
		case JOINTINSPECTIONREPORT:
		case INSPECTIONREPORT:
			return true;

		default:
			return false;
		}
	}

	public boolean isTimeBased(Documenttype dt)
	{
		switch(dt) {
		case DSR:
		case DSI:
		case PRIORITYLISTGENERATION:
		case MISCELLANEOUS_DATED:	
			return true;

		case ACCEPTANCENOTE:
		case WEIGHTCHECKMEMO:
		case REJECTIONNOTE:
		case INSPECTIONREPORT:
		case JOINTINSPECTIONREPORT:
		case DEPOTLAYOUTIMAGE:
		case RODATEEXTENSION:
		case DEPOTCONFIGURATION:
		case DEPOTDYNAMICCONFIGURATION:
		case P_DEPOTCONFIGURATION:
		case P_DEPOTDYNAMICCONFIGURATION:
		case MISCELLANEOUS:
			return false;

		default:
			return false;
		}
	}
}