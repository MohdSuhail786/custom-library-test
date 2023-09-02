import "./CircularCheckbox.scss"

interface IProps {
    size?: number;
    style?: any;
    checked?: boolean;
}

export default function CircularCheckbox({size=20,style,checked=false}:IProps) {
    return (
        <>
        <div className="circular-checkbox checked" style={{...style,width:size,height:size}}>
            {checked && <div className="checked" style={{width: size - 4, height: size - 4}}/>}
        </div>
        </>
    )
}