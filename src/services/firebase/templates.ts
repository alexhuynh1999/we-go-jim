import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { Template, TemplateData } from '@/types/template';

const templatesCollection = (uid: string) => {
  if (!db) throw new Error('Firebase is not configured');
  return collection(db, 'users', uid, 'templates');
};

export const createTemplate = async (
  uid: string,
  template: TemplateData,
): Promise<string> => {
  const docRef = await addDoc(templatesCollection(uid), template);
  return docRef.id;
};

export const getTemplates = async (uid: string): Promise<Template[]> => {
  if (!db) return [];
  const q = query(templatesCollection(uid), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Template[];
};

export const updateTemplate = async (
  uid: string,
  templateId: string,
  data: Partial<TemplateData>,
): Promise<void> => {
  if (!db) throw new Error('Firebase is not configured');
  await updateDoc(doc(db, 'users', uid, 'templates', templateId), data);
};

export const deleteTemplate = async (
  uid: string,
  templateId: string,
): Promise<void> => {
  if (!db) throw new Error('Firebase is not configured');
  await deleteDoc(doc(db, 'users', uid, 'templates', templateId));
};
