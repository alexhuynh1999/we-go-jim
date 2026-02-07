import { useParams } from 'react-router-dom';
import { TemplateEditor } from './TemplateEditor';
import type { Template, TemplateData } from '@/types/template';

interface NewTemplateProps {
  templates?: undefined;
  onSave: (data: TemplateData) => Promise<void>;
  onUpdate?: undefined;
  onCancel: () => void;
  uid?: string;
}

interface EditTemplateProps {
  templates: Template[];
  onSave?: undefined;
  onUpdate: (id: string, data: TemplateData) => Promise<void>;
  onCancel: () => void;
  uid?: string;
}

type TemplateEditorRouteProps = NewTemplateProps | EditTemplateProps;

export const TemplateEditorRoute = (props: TemplateEditorRouteProps) => {
  const { id } = useParams<{ id: string }>();

  if (props.templates && id) {
    const template = props.templates.find((t) => t.id === id);
    return (
      <TemplateEditor
        template={template}
        onSave={async (data) => {
          await props.onUpdate(id, data);
        }}
        onCancel={props.onCancel}
        uid={props.uid}
      />
    );
  }

  return (
    <TemplateEditor
      onSave={async (data) => {
        await props.onSave!(data);
      }}
      onCancel={props.onCancel}
      uid={props.uid}
    />
  );
};
