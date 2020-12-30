import React from "react";
import GenericInput from "./GenericInput";
import { ErrorCodes, GenericInputProps, ValueLabelPair } from "../types";
import makeAnimated from "react-select/animated";
import ReactSelect from "react-select";
const animatedComponents = makeAnimated();

interface CustomSelectSettings {
	requiredNotVisible?: boolean;
	searchTimeout?: number;
	searchable?: boolean;
	showErrorMessage?: boolean;
	placeholderErrorMessage?: boolean;
}

interface CustomSelectProps extends GenericInputProps<any | any[]> {
	options?: ValueLabelPair[];
	settings?: CustomSelectSettings;
	required?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;
	isMulti?: boolean;
	noSelectionText?: string;
}

export default class CustomSelect extends GenericInput<any | any[], CustomSelectProps> {
	isLoading = false;
	searchWaiting = false;
	latestSearchString = "";
	timeout: number | null = null;

	constructor(props: CustomSelectProps) {
		super(props);
		this.reference = React.createRef<any>();
	}

	protected _validate = () => {
		const valid = true;
		const errorCode: ErrorCodes = ErrorCodes.Default;

		return { valid, errorCode };
	};

	private inputChange = (obj: any) => {
		if (obj !== "invalid-input") {
			this.setState(
				{
					value: obj.value
				},
				() => {
					if (this.props.onChange) this.props.onChange(obj.value);
					if (this.props._change) this.props._change({ name: this.props.name, value: obj.value });
				}
			);
		}
	};

	private loadSelected = () => {
		const value = this.props.value ? this.props.value : undefined;
		this.setState({ value });
	};

	componentDidMount() {
		this.loadSelected();
	}

	componentDidUpdate(lastProps: CustomSelectProps) {
		// Default Value is defined
		if (this.props.value !== lastProps.value) {
			this.loadSelected();
		}
	}

	render() {
		const { settings, required, icon, errorIcon, placeholder, disabled, loading, searchable, isMulti } = this.props;
		const { valid, errorMessage } = this.state;

		const options = this.props.options ? this.props.options : [];

		if (!this.props.required && !options.find((x) => x.value === "none") && !isMulti) {
			options.unshift({
				label: this.props.noSelectionText ?? "No selection",
				value: "none"
			});
		}

		let inputPlaceholder = placeholder ?? "Please choose ...";
		if (settings?.placeholderErrorMessage === true && valid === false && errorMessage) {
			inputPlaceholder = errorMessage;
		}

		const value = this.props.options?.find((x) => x.value === this.state.value);

		return (
			<div className={this.buildClassList("onedash-select")}>
				{this.props.label && (
					<label className="onedash-label" htmlFor={this.id}>
						{this.props.label}
						{this.props.required === true && !this.props.settings?.requiredNotVisible && <span className="required">*</span>}
					</label>
				)}
				<div className="input-wrapper">
					{icon && <div className="input-icon">{icon}</div>}
					{errorIcon}
					{valid === false && errorMessage && settings?.showErrorMessage !== false && (
						<label className="error-message" htmlFor={this.id}>
							{errorMessage}
						</label>
					)}
					{required === true && !settings?.requiredNotVisible && <span className="required placeholder-required">*</span>}

					<ReactSelect
						options={options}
						placeholder={inputPlaceholder}
						disabled={disabled}
						onBlur={this.onBlur}
						value={value}
						onFocus={this.onFocus}
						onChange={(value) => this.inputChange(value)}
						isMulti={isMulti}
						isLoading={loading}
						isSearchable={searchable}
						components={animatedComponents}
						style={this.props.style}
						menuPlacement="auto"
						isClearable={!required}
						className="component"
						classNamePrefix="onedash-custom-select"
						loadingMessage={() => "..."}
					/>
				</div>
			</div>
		);
	}
}
