import AppDialog from './AppDialog';

interface PauseDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 일시정지 확인 다이얼로그 (피그마 6:5781) */
export default function PauseDialog({ visible, onCancel, onConfirm }: PauseDialogProps) {
  return (
    <AppDialog
      visible={visible}
      title="잠시 작업을 멈추시겠어요?"
      body="언제든 다시 시작할 수 있어요!"
      cancelLabel="취소"
      confirmLabel="일시 정지"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
