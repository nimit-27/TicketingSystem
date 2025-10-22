import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFaq } from '../services/FaqService';
import SuccessModal from '../components/UI/SuccessModal';
import FailureModal from '../components/UI/FailureModal';
import CustomFormInput from '../components/UI/Input/CustomFormInput';
import Title from '../components/Title';
import { getCurrentUserDetails } from '../config/config';
import GenericButton from '../components/UI/Button';
import GenericSubmitButton from '../components/UI/Button/GenericSubmitButton';
import GenericCancelButton from '../components/UI/Button/GenericCancelButton';
import { useTranslation } from 'react-i18next';

interface FaqFormValues {
  questionEn?: string;
  questionHi?: string;
  answerEn?: string;
  answerHi?: string;
  keywords?: string;
  createdBy?: string;
  createdOn?: string;
}

const FaqForm: React.FC = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FaqFormValues>({ mode: 'onChange' });
  const navigate = useNavigate();
  const [successOpen, setSuccessOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const answerEnRef = useRef<HTMLTextAreaElement | null>(null);
  const answerHiRef = useRef<HTMLTextAreaElement | null>(null);

  const questionEn = watch('questionEn') ?? '';
  const questionHi = watch('questionHi') ?? '';
  const answerEn = watch('answerEn') ?? '';
  const answerHi = watch('answerHi') ?? '';

  const hasQuestion = questionEn.trim().length > 0 || questionHi.trim().length > 0;
  const hasAnswer = answerEn.trim().length > 0 || answerHi.trim().length > 0;
  const isSubmitDisabled = !hasQuestion || !hasAnswer;

  const onSubmit = async (data: FaqFormValues) => {
      data.answerEn = answerEnRef.current?.value;
      data.answerHi = answerHiRef.current?.value;
      data.createdBy = getCurrentUserDetails()?.userId;
      data.createdOn = new Date().toISOString();
      const hasQuestion = data.questionEn || data.questionHi;
      const hasAnswer = data.answerEn || data.answerHi;
      if (!hasQuestion || !hasAnswer) {
          alert('Please provide at least one question and one answer.');
          return;
      }
      if (!data.questionEn || !data.questionHi) {
          const confirm = window.confirm('Are you sure you want to submit without adding both versions of the question?');
          if (!confirm) return;
      }
      if (!data.answerEn || !data.answerHi) {
          const confirm = window.confirm('Are you sure you want to submit without adding both versions of the answer?');
          if (!confirm) return;
      }

      try {
          await createFaq(data);
          setSuccessOpen(true);
      } catch (e) {
          setFailureOpen(true);
      }
  };

  return (
    <div className="p-3">
      <Title textKey="Add Q & A" />
      <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
        <div className="d-flex gap-3">
          <CustomFormInput
            register={register}
            errors={errors}
            name="questionEn"
            placeholder="Question (English)"
          />
          <CustomFormInput
            register={register}
            errors={errors}
            name="questionHi"
            placeholder="Question (Hindi)"
          />
        </div>
        <div className="d-flex gap-3">
          <div className="flex-grow-1">
            <CustomFormInput
              register={register}
              errors={errors}
              name="answerEn"
              placeholder="Answer (English)"
              multiline
              minRows={3}
              inputRef={answerEnRef}
            />
          </div>
          <div className="flex-grow-1">
            <CustomFormInput
              register={register}
              errors={errors}
              name="answerHi"
              placeholder="Answer (Hindi)"
              multiline
              minRows={3}
              inputRef={answerHiRef}
            />
          </div>
        </div>
        <CustomFormInput
          register={register}
          errors={errors}
          name="keywords"
          placeholder="Keywords (pipe separated)"
        />
        <GenericSubmitButton type="submit" className="align-self-end" disabled={isSubmitDisabled} textKey="Submit" />
        <GenericCancelButton className="align-self-end" onClick={() => navigate(-1)} textKey="Cancel" />
      </form>

      <SuccessModal
        open={successOpen}
        title="Question and answer created successfully"
        onClose={() => { setSuccessOpen(false); reset(); }}
        actions={(
          <>
            <GenericButton variant='outlined' onClick={() => { setSuccessOpen(false); reset(); }}>
              Create a new question and answer
            </GenericButton>
            <GenericButton variant='outlined' onClick={() => navigate('/faq')}>
              {t('Go to FAQ')}
            </GenericButton>
          </>
        )}
      />

      <FailureModal
        open={failureOpen}
        title="Failed to create question and answer"
        onClose={() => setFailureOpen(false)}
      />
    </div>
  );
};

export default FaqForm;

