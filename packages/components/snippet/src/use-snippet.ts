import type {SnippetVariantProps, SnippetSlots, SlotsToClasses} from "@nextui-org/theme";

import {snippet} from "@nextui-org/theme";
import {HTMLNextUIProps, mapPropsVariants, PropGetter} from "@nextui-org/system";
import {useDOMRef} from "@nextui-org/dom-utils";
import {clsx, dataAttr, ReactRef} from "@nextui-org/shared-utils";
import {useClipboard} from "@nextui-org/use-clipboard";
import {useFocusRing} from "@react-aria/focus";
import {useMemo, useCallback, ReactElement} from "react";
import {TooltipProps} from "@nextui-org/tooltip";
import {ButtonProps} from "@nextui-org/button";
export interface UseSnippetProps
  extends Omit<HTMLNextUIProps<"div">, "onCopy">,
    SnippetVariantProps {
  /**
   * Ref to the DOM node.
   */
  ref?: ReactRef<HTMLDivElement | null>;
  /**
   * The content of the snippet.
   * if `string[]` is passed, it will be rendered as a multi-line snippet.
   */
  children?: React.ReactNode | string | string[];
  /**
   * The symbol to show before the snippet.
   * @default "$"
   */
  symbol?: string | React.ReactNode;
  /**
   * The time in milliseconds to wait before resetting the clipboard.
   * @default 2000
   */
  timeout?: number;
  /*
   * Snippet copy icon.
   */
  copyIcon?: ReactElement;
  /*
   * Snippet copy icon. This icon will be shown when the text is copied.
   */
  checkIcon?: ReactElement;
  /**
   * Classname or List of classes to change the classNames of the element.
   * if `className` is passed, it will be added to the base slot.
   *
   * @example
   * ```ts
   * <Snippet classNames={{
   *    base:"base-classes",
   *    pre: "pre-classes",
   *    copyButton: "copy-classes", // copy button classes
   *    copyIcon: "copy-classes", // copy icon classes
   *    checkIcon: "check-classes", // check icon classes
   * }} />
   * ```
   */
  classNames?: SlotsToClasses<SnippetSlots>;
  /**
   * Whether the copy button should receive focus on render.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Whether to hide the tooltip.
   * @default false
   */
  disableTooltip?: boolean;
  /**
   * Whether to disable the copy functionality.
   * @default false
   */
  disableCopy?: boolean;
  /**
   * Whether to hide the copy button.
   * @default false
   */
  hideCopyButton?: boolean;
  /**
   * Whether to hide the symbol.
   * @default false
   */
  hideSymbol?: boolean;
  /**
   * Tooltip props.
   * @see [Tooltip](https://nextui.org/components/tooltip) for more details.
   * @default {
   *  offset: 15,
   *  delay: 1000,
   *  content: "Copy to clipboard",
   *  variant: snippetProps?.variant, // same as the snippet variant
   *  color: snippetProps?.color, // same as the snippet color
   *  isDisabled: disableCopy,
   * }
   */
  tooltipProps?: TooltipProps;
  /**
   * Copy button props.
   * @see [Button](https://nextui.org/components/button) for more details.
   * @default {
   *   isDisabled: disableCopy,
   *   onPress: onCopy
   *   size:"sm",
   *   radius: "lg",
   *   variant:"light",
   *   isIconOnly: true,
   * }
   */
  copyButtonProps?: ButtonProps;
  /**
   * Callback when the text is copied.
   */
  onCopy?: (value: string | string[]) => void;
}

export function useSnippet(originalProps: UseSnippetProps) {
  const [props, variantProps] = mapPropsVariants(originalProps, snippet.variantKeys);

  const {
    ref,
    as,
    children,
    symbol = "$",
    classNames,
    timeout,
    copyIcon,
    checkIcon,
    disableCopy = false,
    disableTooltip = false,
    hideCopyButton = false,
    autoFocus = false,
    hideSymbol = false,
    onCopy: onCopyProp,
    tooltipProps = {
      offset: 15,
      delay: 1000,
      content: "Copy to clipboard",
      variant: originalProps?.variant as TooltipProps["variant"],
      color: originalProps?.color as TooltipProps["color"],
      isDisabled: disableCopy,
    },
    copyButtonProps,
    className,
    ...otherProps
  } = props;

  const Component = as || "div";

  const domRef = useDOMRef(ref);

  const {copy, copied} = useClipboard({timeout});

  const isMultiLine = children && Array.isArray(children);

  const {isFocusVisible, isFocused, focusProps} = useFocusRing({
    autoFocus,
  });

  const slots = useMemo(
    () =>
      snippet({
        ...variantProps,
      }),
    [...Object.values(variantProps)],
  );

  const symbolBefore = useMemo(() => {
    if (!symbol || typeof symbol !== "string") return symbol;
    const str = symbol.trim();

    return str ? `${str} ` : "";
  }, [symbol]);

  const baseStyles = clsx(className, classNames?.base);

  const getSnippetProps = useCallback<PropGetter>(
    () => ({
      className: slots.base({
        class: baseStyles,
      }),
      ...otherProps,
    }),
    [slots, baseStyles, isMultiLine, otherProps],
  );

  const onCopy = useCallback(() => {
    if (disableCopy) {
      return;
    }
    let value = "";

    if (typeof children === "string") {
      value = children;
    } else if (Array.isArray(children)) {
      value = children.join("\n");
    }

    copy(value);
    onCopyProp?.(value);
  }, [copy, disableCopy, onCopyProp, children]);

  const defaultCopyButtonProps: ButtonProps = {
    "aria-label": "Copy to clipboard",
    size: "sm",
    variant: "light",
    radius: "lg",
    isDisabled: disableCopy,
    onPress: onCopy,
    isIconOnly: true,
    ...copyButtonProps,
  };

  const getCopyButtonProps = useCallback(
    () =>
      ({
        ...defaultCopyButtonProps,
        "data-copied": dataAttr(copied),
        className: slots.copyButton({
          class: clsx(classNames?.copyButton),
        }),
      } as ButtonProps),
    [
      slots,
      isFocusVisible,
      isFocused,
      disableCopy,
      classNames?.copyButton,
      defaultCopyButtonProps,
      focusProps,
    ],
  );

  return {
    Component,
    as,
    domRef,
    children,
    slots,
    classNames,
    copied,
    onCopy,
    copyIcon,
    checkIcon,
    symbolBefore,
    isMultiLine,
    isFocusVisible,
    hideCopyButton,
    disableCopy,
    disableTooltip,
    hideSymbol,
    tooltipProps,
    getSnippetProps,
    getCopyButtonProps,
  };
}

export type UseSnippetReturn = ReturnType<typeof useSnippet>;