import { ISliderPhoto, ImageSlider } from "./components/ImageSliderPCF";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";

export class ImageSlide implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    images: ISliderPhoto[];

    /**
     * Empty constructor.
     */
    constructor() {}

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        // Check if the user is the test harness which does not provide updatedProperties
        const isTestHarness = context.userSettings.userId === '{00000000-0000-0000-0000-000000000000}';
        
        // Check if the dataset has changed or if the user is the test harness
        const datasetChanged = !this.images || context.updatedProperties.indexOf('dataset') > -1;
        if (datasetChanged || isTestHarness) {
            // Get the images dataset from the PCF context
            const dataset = context.parameters.Images;

            // Convert the dataset records into the ISliderPhoto interface
            this.images = dataset.sortedRecordIds.map((id) => {
                const record = dataset.records[id];
                const imageValue = record.getValue('ImageContent') as any;

                let fileContent = ''

                // Support the PCF tester where the image is a string
                if (typeof imageValue === 'string') {
                    fileContent = imageValue
                }

                if (imageValue?.thumbnailUrl) {
                    fileContent = imageValue.thumbnailUrl + '&Full=true';
                }

                // Support Model-Driven Apps where Image columns cannot be bound and so we pick up the first Image column
                if (!fileContent) {
                    const imageColumn = dataset.columns.find(c=>(record?.getValue(c.name) as any)?.thumbnailUrl);
                    fileContent = imageColumn ? (record.getValue(imageColumn.name) as any).thumbnailUrl + '&Full=true' : '';
                }

                // Support images in Power Pages where the content is a binary array
                if (!fileContent) {
                    const imageColumn = dataset.columns.find(c=>Array.isArray(record?.getValue(c.name)));
                    if (imageColumn){
                        // Construct the image URL in the format /Image/download.aspx?entity=<entity_logicalname>&attribute=<attribute>&ID=<recordid>&Full=true
                        const entityLogicalName = dataset.getTargetEntityType();
                        const attribute = imageColumn.name;
                        const recordId = record.getRecordId();
                        fileContent = `/Image/download.aspx?entity=${entityLogicalName}&attribute=${attribute}&ID=${recordId}&Full=true`;
                    }   
                   
                }

                // Return the ISliderPhoto object
                return {
                    id: record.getRecordId(),
                    title: record.getValue('ImageName') as string,
                    src: fileContent ? fileContent : ''
                } as ISliderPhoto;
            });
        }

        // Render the ImageSlider component
        return React.createElement(
            ImageSlider, { images: this.images }
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
