import { cardContainer1, cardContainer1Header } from "../../constants/bootstrapClasses";
import { FormProps } from "../../types";
import CustomFormInput from "../UI/Input/CustomFormInput";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../UI/Fieldset/CustomFieldset";
import PersonIcon from "@mui/icons-material/Person";
import CallIcon from "@mui/icons-material/Call";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Controller } from "react-hook-form";

const ticketModes = [
    { label: "Self", value: "Self", icon: <PersonIcon /> },
    { label: "Call", value: "Call", icon: <CallIcon /> },
    { label: "Mail", value: "Mail", icon: <MailOutlineIcon /> }
];

const RequestDetails: React.FC<FormProps> = ({ register, control, errors }) => (
    <div className={`${cardContainer1}`}>
        {/* title */}
        <p className={`${cardContainer1Header}`}>Request Details</p>
        {/* Inputs in a row */}
        <div className="row g-3">
            {/* Ticket ID - Input - System Generated */}
            <div className="col-md-4">
                <CustomFormInput name="ticketId" register={register} required errors={errors} label="Ticket ID" />
            </div>
            {/* Reported Date - Input - System Generated */}
            <div className="col-md-4">
                <CustomFormInput
                    name="reportedDate"
                    register={register}
                    required
                    errors={errors}
                    label="Reported Date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    disabled
                />
            </div>
            {/* Ticket Lodged Through - Icons */}
            <div className="col-md-4">
                <Controller
                    name="mode"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <CustomFieldset title="Request Mode">
                            <div className="d-flex justify-content-around">
                                {ticketModes.map((m) => (
                                    <CustomIconButton
                                        key={m.value}
                                        label={m.label}
                                        icon={m.icon}
                                        selected={field.value === m.value}
                                        onClick={() => field.onChange(m.value)}
                                    />
                                ))}
                            </div>
                        </CustomFieldset>
                    )}
                />
            </div>
        </div>
    </div>
);

export default RequestDetails;
