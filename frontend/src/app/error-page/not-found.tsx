import FuzzyText from '@/components/FuzzyText';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center h-screen flex-col gap-6">
            <FuzzyText
                baseIntensity={0.1}
                hoverIntensity={0.3}
                enableHover={true}
            >
                404
            </FuzzyText>
            <FuzzyText
                baseIntensity={0.1}
                hoverIntensity={0.3}
                enableHover={true}
            >
                Not Found
            </FuzzyText>
        </div>
    );
}