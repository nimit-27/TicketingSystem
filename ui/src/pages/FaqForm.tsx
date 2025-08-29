import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFaq } from '../services/FaqService';
import SuccessModal from '../components/UI/SuccessModal';
import FailureModal from '../components/UI/FailureModal';
import CustomFormInput from '../components/UI/Input/CustomFormInput';

interface FaqFormValues {
  questionEn?: string;
  questionHi?: string;
  answerEn?: string;
  answerHi?: string;
  keywords?: string;
}

const FaqForm: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FaqFormValues>();
  const navigate = useNavigate();
  const [successOpen, setSuccessOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const answerEnRef = useRef<HTMLTextAreaElement | null>(null);
  const answerHiRef = useRef<HTMLTextAreaElement | null>(null);

  const onSubmit = async (data: FaqFormValues) => {
      data.answerEn = answerEnRef.current?.value;
      data.answerHi = answerHiRef.current?.value;
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
        <button type="submit" className="btn btn-primary align-self-end">Submit</button>
      </form>

      <SuccessModal
        open={successOpen}
        title="Question and answer created successfully"
        onClose={() => { setSuccessOpen(false); reset(); }}
        actions={(
          <>
            <button className="btn btn-outline-primary" onClick={() => { setSuccessOpen(false); reset(); }}>
              Create a new question and answer
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/faq')}>
              Go to FAQ
            </button>
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

