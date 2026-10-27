import AppDialog from './AppDialog';

interface DeleteTaskDialogProps {
  visible: boolean;
  taskTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 투두리스트 일정 삭제 확인 팝업 (피그마 6:4207) */
export default function DeleteTaskDialog({ visible, taskTitle, onCancel, onConfirm }: DeleteTaskDialogProps) {
  return (
    <AppDialog
      visible={visible}
      title="해당 일정을 삭제할까요?"
      subject={`“${taskTitle}”`}
      body="삭제하면 다시 되돌릴 수 없어요."
      cancelLabel="취소"
      confirmLabel="삭제"
      confirmTone="dark"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
