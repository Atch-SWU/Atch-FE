import AppDialog from './AppDialog';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 범용 확인 다이얼로그 */
export default function ConfirmDialog({
  visible, title, body, cancelLabel, confirmLabel, onCancel, onConfirm,
}: ConfirmDialogProps) {
  return (
    <AppDialog
      visible={visible}
      title={title}
      body={body}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
