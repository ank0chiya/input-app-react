import logging
import os


class MyFileHandler(logging.FileHandler):
    def __init__(
        self,
        filename,
        mode="a",
        encoding=None,
        delay=False,
        errors=None,
        permissions=0o600,
    ):
        """
        カスタムパーミッションを指定できるFileHandler。
        permissions: 8進数でパーミッションを指定 (例: 0o600)
        """
        self.permissions = permissions
        # FileHandlerのコンストラクタではファイルを開かないように delay=True を渡すことが多いですが、
        # _openをオーバーライドするので、直接super().__init__で処理させても問題ありません。
        # ただし、親クラスの__init__でファイルが開かれる前にパーミッションを設定したいため、
        # ここではfilenameを渡さずに後で設定するか、_openで常に指定のパーミッションを使うようにします。
        # より安全なのは、親クラスのファイルオープンロジックを完全にオーバーライドすることです。

        # FileHandlerの__init__では、filenameが与えられるとすぐにファイルを開こうとするため、
        # ここで self.baseFilename を設定し、親クラスにはダミーのファイル名を渡すか、
        # _open が呼び出されるタイミングで self.baseFilename を使うようにします。
        # 今回は _open を完全にオーバーライドするため、親クラスの初期化はそのまま行います。
        self.user_filename = filename  # 実際のファイル名を保持
        super().__init__(filename, mode, encoding, delay, errors)

    def _open(self):
        # os.open() を使用してファイルを開き、パーミッションを明示的に指定
        # O_CREAT: ファイルが存在しない場合は作成
        # O_WRONLY: 書き込み専用で開く
        # O_APPEND: 追記モード (mode='a' の場合)
        # mode='w' の場合は O_TRUNC を追加するなどの調整が必要
        open_flags = os.O_WRONLY | os.O_CREAT
        if self.mode == "a":
            open_flags |= os.O_APPEND
        elif self.mode == "w":  # 'w' や 'w+' の場合
            open_flags |= os.O_TRUNC

        # umaskを一時的に0にして、指定したパーミッションがそのまま適用されるようにする
        original_umask = os.umask(0)
        try:
            # self.baseFilename は親クラスで設定される実際のファイルパス
            fd = os.open(self.baseFilename, open_flags, self.permissions)
            stream = os.fdopen(
                fd, self.mode, encoding=self.encoding, errors=self.errors
            )
        finally:
            os.umask(original_umask)  # umaskを元に戻す
        return stream


# ロガーの設定
logger = logging.getLogger("permission_test_logger")
logger.setLevel(logging.INFO)

# カスタムハンドラを使用 (パーミッションを 0o600 rw------- に設定)
# ファイルが存在しない場合にこのパーミッションで作成されます。
# ファイルが既に存在し、かつ追記モードの場合、既存ファイルのパーミッションは変更されません。
# もし既存ファイルのパーミッションも変更したい場合は、ファイルを開く前に os.chmod() を呼び出す必要があります。
file_handler = MyFileHandler(
    "app_specific_permission.log", mode="w", permissions=0o600
)  # 'w'で新規作成または上書き
# file_handler = MyFileHandler('app_specific_permission.log', mode='a', permissions=0o600) # 'a'で追記

formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

logger.info("このログは指定されたパーミッションでファイルに書き込まれます。")

print(
    f"ログファイル 'app_specific_permission.log' を確認してください。パーミッションが {oct(0o600)} になっているはずです。"
)
