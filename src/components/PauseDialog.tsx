import AppDialog from './AppDialog';

interface PauseDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 일시정지 확인 다이얼로그 */
export default function PauseDialog({ visible, onCancel, onConfirm }: PauseDialogProps) {
  return (
    <AppDialog
      visible={visible}
      title="잠시 일시 정지 하시겠습니까?"
      body="이후 다시 작업 재개할 수 있습니다"
      cancelLabel="취소"
      confirmLabel="정지"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
