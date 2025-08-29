import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createFaq } from '../services/FaqService';
import SuccessModal from '../components/UI/SuccessModal';
import FailureModal from '../components/UI/FailureModal';

interface FaqFormValues {
  questionEn?: string;
  questionHi?: string;
  answerEn?: string;
  answerHi?: string;
  keywords?: string;
}

const FaqForm: React.FC = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FaqFormValues>();
  const navigate = useNavigate();
  const [successOpen, setSuccessOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);

  const onSubmit = async (data: FaqFormValues) => {
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

  const answerEn = watch('answerEn') || '';
  const answerHi = watch('answerHi') || '';

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
        <div className="d-flex gap-3">
          <input className="form-control" placeholder="Question (English)" {...register('questionEn')} />
          <input className="form-control" placeholder="Question (Hindi)" {...register('questionHi')} />
        </div>
        <div className="d-flex gap-3">
          <div className="flex-grow-1">
            <ReactQuill value={answerEn} onChange={(v) => setValue('answerEn', v)} />
          </div>
          <div className="flex-grow-1">
            <ReactQuill value={answerHi} onChange={(v) => setValue('answerHi', v)} />
          </div>
        </div>
        <input className="form-control" placeholder="Keywords (pipe separated)" {...register('keywords')} />
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

