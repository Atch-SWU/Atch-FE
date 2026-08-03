import AppDialog from './AppDialog';

interface ExtendDialogProps {
  visible: boolean;
  countdown: number;
  title?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 시간 종료/초과 재개 시 연장 확인 (10초 후 자동 연장) */
export default function ExtendDialog({
  visible, countdown, title = '시간을 연장할까요?', onCancel, onConfirm,
}: ExtendDialogProps) {
  return (
    <AppDialog
      visible={visible}
      title={title}
      body={`${countdown}초 후 자동으로 연장됩니다`}
      cancelLabel="취소"
      confirmLabel={`확인 (${countdown})`}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
