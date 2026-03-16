import Add from "./add.svg?react";
import ArrowDownPlain from "./arrow-down-1.svg?react";
import ArrowLeftPlain from "./arrow-left-2.svg?react";
import ArrowLeft from "./arrow-left.svg?react";
import ArrowRight1 from "./arrow-right-1.svg?react";
import ArrowRightPlain from "./arrow-right-3.svg?react";
import ArrowRight from "./arrow-right.svg?react";
import ArrowUpPlain from "./arrow-up-2.svg?react";
import BookSaved from "./book-saved.svg?react";
import Calendar from "./calendar-2.svg?react";
import CategoryBold from "./category-bold.svg?react";
import ClipboardText from "./clipboard-text.svg?react";
import Clipboard from "./clipboard.svg?react";
import CloseCircle from "./close-circle.svg?react";
import DirectDown from "./direct-down.svg?react";
import DocumentCopy from "./document-copy.svg?react";
import DocumentDownload from "./document-download.svg?react";
import DocumentWithTextFolded from "./document-text-1.svg?react";
import EditLine from "./edit-2.svg?react";
import Eye from "./eye.svg?react";
import FilterEdit from "./filter-edit.svg?react";
import Judge from "./judge.svg?react";
import Layer from "./layer.svg?react";
import Logout from "./logout.svg?react";
import Maximize from "./maximize-4.svg?react";
import MenuLines from "./menu-1.svg?react";
import MessageQuestion from "./message-question.svg?react";
import MinusCircle from "./minus-cirlce.svg?react";
import MinusSquare from "./minus-square.svg?react";
import Minus from "./minus.svg?react";
import MonitorRecorder from "./monitor-recorder.svg?react";
import More from "./more.svg?react";
import Note2 from "./note-2.svg?react";
import NoteText from "./note-text.svg?react";
import Notification from "./notification.svg?react";
import People from "./people.svg?react";
import ParagraphSpacing from "./pharagraphspacing.svg?react";
import SearchNormalOne from "./search-normal-1.svg?react";
import Setting2 from "./setting-2.svg?react";
import Setting3 from "./setting-3.svg?react";
import Speedometer from "./speedometer.svg?react";
import TickCircle from "./tick-circle.svg?react";
import TOggleOffCircle from "./toggle-off-circle.svg?react";
import Trash from "./trash.svg?react";
import Warning2 from "./warning-2.svg?react";

import { Filter, LayoutGrid, Table } from "lucide-react";
import Audio from "./audio-square.svg?react";
import Award from "./award.svg?react";
import Book from "./book.svg?react";
import Building from "./building-4.svg?react";
import EyeSlash from "./eye-slash.svg?react";
import Programming from "./programming-arrow.svg?react";
import Share from "./share.svg?react";
import TicketDiscount from "./ticket-discount.svg?react";
import Video from "./video.svg?react";
import AddSquare from "./add-square.svg?react";
export const icons = {
    "add-square": AddSquare,
    "message-question": MessageQuestion,
    "book-saved": BookSaved,
    date: Calendar,
    "clipboard-text": ClipboardText,
    "document-download": DocumentDownload,
    "document-copy": DocumentCopy,
    "close-circle": CloseCircle,
    "monitor-recorder": MonitorRecorder,
    "iconsax-ticket-discount": TicketDiscount,
    "note-2": Note2,
    "setting-2": Setting2,
    "setting-3": Setting3,
    "arrow-up-plain": ArrowUpPlain,
    "arrow-left": ArrowLeft,
    "arrow-right": ArrowRight,
    "arrow-down-plain": ArrowDownPlain,
    "arrow-right-1": ArrowRight1,
    "direct-down": DirectDown,
    "minus-circle": MinusCircle,
    "minus-square": MinusSquare,
    "tick-circle": TickCircle,
    "warning-2": Warning2,
    "filter-edit": FilterEdit,
    // "user-edit": UserEdit,
    // "user-remove": UserRemove,
    "search-normal-1": SearchNormalOne,
    "menu-lines": MenuLines,
    "toggle-off-circle": TOggleOffCircle,
    "note-text": NoteText,
    "edit-line": EditLine,
    "eye-slash": EyeSlash,
    "arrow-right-plain": ArrowRightPlain,
    "arrow-left-plain": ArrowLeftPlain,
    "category-bold": CategoryBold,
    "paragraph-spacing": ParagraphSpacing,
    "document-with-text-folded": DocumentWithTextFolded,
    "building-variant": Building,
    "layout-grid": LayoutGrid,
    table: Table,
    audio: Audio,
    funnel: Filter,
    trash: Trash,
    maximize: Maximize,
    award: Award,
    judge: Judge,
    layer: Layer,
    logout: Logout,
    add: Add,
    more: More,
    clipboard: Clipboard,
    minus: Minus,
    notification: Notification,
    people: People,
    speedometer: Speedometer,
    book: Book,
    eye: Eye,
    programming: Programming,
    video: Video,
    share: Share,
};

export type IconsaxIcon = keyof typeof icons;
