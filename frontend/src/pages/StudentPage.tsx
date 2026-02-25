import React, { useState } from 'react';
import { useGetAllStudents, useDeleteStudent } from '../hooks/useQueries';
import { Student } from '../backend';
import { Plus, Pencil, Trash2, Loader2, Search, Users } from 'lucide-react';
import { formatDateFromNano } from '../utils/exportCSV';
import StudentFormModal from '../components/StudentFormModal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

export default function StudentPage() {
  const { data: students, isLoading } = useGetAllStudents();
  const deleteStudent = useDeleteStudent();
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [search, setSearch] = useState('');

  const filtered = students?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentClass.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleEdit = (s: Student) => {
    setEditStudent(s);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteStudent.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Students</h2>
          <p className="text-muted-foreground text-sm">{students?.length ?? 0} registered students</p>
        </div>
        <button
          onClick={() => { setEditStudent(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, oklch(0.62 0.2 145), oklch(0.55 0.22 165))' }}
        >
          <Plus className="w-4 h-4" />
          New Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No students found</p>
            <p className="text-sm">Add a new student to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Class</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">School</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">DOB</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Taluka</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={String(s.id)} className={`border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">Class {s.studentClass}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Class {s.studentClass}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.schoolName}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDateFromNano(s.dob)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.taluka}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <StudentFormModal
          student={editStudent}
          onClose={() => { setShowForm(false); setEditStudent(null); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
