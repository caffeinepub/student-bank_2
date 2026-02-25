import React, { useState, useEffect } from 'react';
import { Student } from '../backend';
import { useAddStudent, useUpdateStudent } from '../hooks/useQueries';
import { X, Loader2 } from 'lucide-react';
import { dateToNano, nanoToDateInput } from '../utils/exportCSV';

interface Props {
  student: Student | null;
  onClose: () => void;
}

export default function StudentFormModal({ student, onClose }: Props) {
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();

  const [form, setForm] = useState({
    name: '',
    dob: '',
    studentClass: '',
    attendanceNumber: '',
    schoolName: '',
    taluka: '',
    district: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        dob: nanoToDateInput(student.dob),
        studentClass: student.studentClass,
        attendanceNumber: String(student.attendanceNumber),
        schoolName: student.schoolName,
        taluka: student.taluka,
        district: student.district,
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.dob || !form.studentClass || !form.attendanceNumber || !form.schoolName || !form.taluka || !form.district) {
      setError('All fields are required');
      return;
    }
    try {
      const data = {
        name: form.name,
        dob: dateToNano(form.dob),
        studentClass: form.studentClass,
        attendanceNumber: BigInt(form.attendanceNumber),
        schoolName: form.schoolName,
        taluka: form.taluka,
        district: form.district,
      };
      if (student) {
        await updateStudent.mutateAsync({ id: student.id, ...data });
      } else {
        await addStudent.mutateAsync(data);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
    }
  };

  const isPending = addStudent.isPending || updateStudent.isPending;

  const fields = [
    { name: 'name', label: 'Student Name', type: 'text', placeholder: 'Enter full name' },
    { name: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
    { name: 'studentClass', label: 'Class', type: 'text', placeholder: 'e.g. 5th, 6th' },
    { name: 'attendanceNumber', label: 'Attendance Number', type: 'number', placeholder: 'Enter attendance number' },
    { name: 'schoolName', label: 'School Name', type: 'text', placeholder: 'Enter school name' },
    { name: 'taluka', label: 'Taluka', type: 'text', placeholder: 'Enter taluka' },
    { name: 'district', label: 'District', type: 'text', placeholder: 'Enter district' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h3 className="font-heading font-bold text-foreground">
              {student ? 'Edit Student' : 'New Student'}
            </h3>
            <p className="text-xs text-muted-foreground">Fill in the student details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                required
              />
            </div>
          ))}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.45 0.25 290))' }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {student ? 'Update' : 'Save'} Student
          </button>
        </div>
      </div>
    </div>
  );
}
